#!/usr/bin/env node
// End-to-end production deploy for Aileen's Beauty check-in app.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... VERCEL_TOKEN=... node scripts/deploy-live.mjs
//
// What it does (idempotent — safe to re-run):
//   1. Creates (or reuses) the Supabase project "aileens-checkin"
//   2. Loads the database schema from supabase/migrations/0001_init.sql
//   3. Creates (or reuses) the Vercel project "aileens-checkin" linked to the
//      GitHub repo with root directory checkin-app
//   4. Sets DATABASE_URL / DIRECT_URL / AUTH_SECRET / BUSINESS_TIMEZONE
//   5. Triggers a production deployment from main and waits for READY
//   6. Smoke-tests the live URL and prints it
//
// Requires Node 18+. No other dependencies.

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB_REPO = "tommywtran76/tommyhyundaiofgilroy";
const SUPA_NAME = "aileens-checkin";
const VERCEL_NAME = "aileens-checkin";
const REGION = "us-west-1";
const STATE_FILE = join(ROOT, ".deploy-state.json"); // gitignored; holds db password between runs

const SB = process.env.SUPABASE_ACCESS_TOKEN;
const VC = process.env.VERCEL_TOKEN;
if (!SB || !VC) {
  console.error("Set SUPABASE_ACCESS_TOKEN and VERCEL_TOKEN environment variables.");
  process.exit(1);
}

const log = (msg) => console.log(`\x1b[36m▸\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(base, token, path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, ok: res.ok, json, text };
}
const supa = (path, opts) => api("https://api.supabase.com", SB, path, opts);
const vercel = (path, opts) => api("https://api.vercel.com", VC, path, opts);

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}
function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── 1. Supabase project ────────────────────────────────────────────────────
async function ensureSupabaseProject() {
  const state = loadState();

  const orgs = await supa("/v1/organizations");
  if (!orgs.ok) die(`Supabase token rejected (${orgs.status}): ${orgs.text}`);
  if (!orgs.json?.length) die("No Supabase organization found on this account.");
  const org = orgs.json[0];
  log(`Supabase organization: ${org.name}`);

  const projects = await supa("/v1/projects");
  if (!projects.ok) die(`Could not list Supabase projects: ${projects.text}`);
  let project = projects.json.find((p) => p.name === SUPA_NAME);

  let dbPass = state.dbPass;
  if (!project) {
    dbPass = randomBytes(18).toString("base64url");
    saveState({ ...state, dbPass });
    log(`Creating Supabase project "${SUPA_NAME}" in ${REGION}…`);
    const created = await supa("/v1/projects", {
      method: "POST",
      body: JSON.stringify({
        organization_id: org.id,
        name: SUPA_NAME,
        region: REGION,
        db_pass: dbPass,
      }),
    });
    if (!created.ok) die(`Project creation failed (${created.status}): ${created.text}`);
    project = created.json;
  } else {
    log(`Reusing existing Supabase project ${project.id}`);
    if (!dbPass) {
      log("Resetting the database password so connection strings can be built…");
      dbPass = randomBytes(18).toString("base64url");
      const reset = await supa(`/v1/projects/${project.id}/database/password`, {
        method: "PUT",
        body: JSON.stringify({ password: dbPass }),
      });
      if (!reset.ok) die(`Password reset failed (${reset.status}): ${reset.text}`);
      saveState({ ...state, dbPass });
    }
  }

  const ref = project.id;
  log(`Waiting for project ${ref} to become healthy…`);
  for (let i = 0; i < 60; i++) {
    const p = await supa(`/v1/projects/${ref}`);
    if (p.json?.status === "ACTIVE_HEALTHY") break;
    if (i === 59) die(`Project did not become healthy in time (status: ${p.json?.status}).`);
    await sleep(5000);
  }
  log("Supabase project is healthy.");
  return { ref, dbPass };
}

// ─── 2. Schema ──────────────────────────────────────────────────────────────
async function loadSchema(ref) {
  const sqlPath = join(ROOT, "supabase", "migrations", "0001_init.sql");
  if (!existsSync(sqlPath)) die(`Missing ${sqlPath}`);
  const sql = readFileSync(sqlPath, "utf8");
  log("Loading database schema…");
  const res = await supa(`/v1/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query: sql }),
  });
  // "already exists" errors mean a previous run loaded it — that's fine.
  if (!res.ok && !/already exists/i.test(res.text)) {
    die(`Schema load failed (${res.status}): ${res.text}`);
  }
  const check = await supa(`/v1/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "select count(*)::int as tables from information_schema.tables where table_schema='public'",
    }),
  });
  const count = check.json?.[0]?.tables ?? "?";
  log(`Schema ready (${count} tables in public).`);
}

// ─── 3–4. Vercel project + env ──────────────────────────────────────────────
async function ensureVercelProject(env) {
  const user = await vercel("/v2/user");
  if (!user.ok) die(`Vercel token rejected (${user.status}): ${user.text}`);

  const teamsRes = await vercel("/v2/teams");
  const team = teamsRes.json?.teams?.[0];
  const teamQS = team ? `?teamId=${team.id}` : "";
  log(team ? `Vercel team: ${team.slug}` : `Vercel personal account: ${user.json?.user?.username}`);

  let project;
  const existing = await vercel(`/v9/projects/${VERCEL_NAME}${teamQS}`);
  if (existing.ok) {
    project = existing.json;
    log(`Reusing existing Vercel project ${project.id}`);
  } else {
    log(`Creating Vercel project "${VERCEL_NAME}" linked to ${GITHUB_REPO}…`);
    const created = await vercel(`/v10/projects${teamQS}`, {
      method: "POST",
      body: JSON.stringify({
        name: VERCEL_NAME,
        framework: "nextjs",
        rootDirectory: "checkin-app",
        gitRepository: { type: "github", repo: GITHUB_REPO },
      }),
    });
    if (!created.ok) die(`Vercel project creation failed (${created.status}): ${created.text}`);
    project = created.json;
  }

  log("Setting environment variables…");
  const envRes = await vercel(
    `/v10/projects/${project.id}/env${teamQS ? teamQS + "&" : "?"}upsert=true`,
    {
      method: "POST",
      body: JSON.stringify(
        Object.entries(env).map(([key, value]) => ({
          key,
          value,
          type: "encrypted",
          target: ["production", "preview"],
        })),
      ),
    },
  );
  if (!envRes.ok) die(`Setting env vars failed (${envRes.status}): ${envRes.text}`);

  return { project, teamQS };
}

// ─── 5. Deploy ──────────────────────────────────────────────────────────────
async function deploy(project, teamQS) {
  const repoId = project.link?.repoId;
  if (!repoId) die("Project is not linked to the GitHub repo — link it in the Vercel dashboard.");
  log("Triggering production deployment from main…");
  const dep = await vercel(`/v13/deployments${teamQS ? teamQS + "&" : "?"}forceNew=1`, {
    method: "POST",
    body: JSON.stringify({
      name: VERCEL_NAME,
      project: project.id,
      target: "production",
      gitSource: { type: "github", repoId, ref: "main" },
    }),
  });
  if (!dep.ok) die(`Deployment trigger failed (${dep.status}): ${dep.text}`);

  const id = dep.json.id;
  log(`Deployment ${id} started — waiting for READY (this takes 2–4 minutes)…`);
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    const d = await vercel(`/v13/deployments/${id}${teamQS}`);
    const state = d.json?.readyState || d.json?.state;
    if (state === "READY") return d.json;
    if (state === "ERROR" || state === "CANCELED") {
      die(`Deployment ${state}. Inspect: https://vercel.com — deployment ${id}`);
    }
  }
  die("Deployment did not finish in 10 minutes — check the Vercel dashboard.");
}

// ─── 6. Smoke test ──────────────────────────────────────────────────────────
async function smokeTest(base) {
  log(`Smoke-testing ${base} …`);
  const kiosk = await fetch(`${base}/kiosk`);
  const boot = await fetch(`${base}/api/admin/bootstrap`);
  const bootJson = await boot.json().catch(() => null);
  console.log(`  /kiosk                → ${kiosk.status}`);
  console.log(`  /api/admin/bootstrap  → ${boot.status} ${JSON.stringify(bootJson)}`);
  if (!kiosk.ok || !boot.ok) die("Smoke test failed — the site is up but returned errors.");
}

// ─── main ───────────────────────────────────────────────────────────────────
const { ref, dbPass } = await ensureSupabaseProject();
await loadSchema(ref);

const authSecret = loadState().authSecret || randomBytes(32).toString("hex");
saveState({ ...loadState(), authSecret });

const env = {
  DATABASE_URL: `postgresql://postgres.${ref}:${dbPass}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`,
  DIRECT_URL: `postgresql://postgres:${dbPass}@db.${ref}.supabase.co:5432/postgres`,
  AUTH_SECRET: authSecret,
  BUSINESS_TIMEZONE: "America/Los_Angeles",
};

const { project, teamQS } = await ensureVercelProject(env);
const deployment = await deploy(project, teamQS);
const url = `https://${VERCEL_NAME}.vercel.app`;
await smokeTest(url);

console.log("\n\x1b[32m✔ DEPLOYED\x1b[0m");
console.log(`  Kiosk:      ${url}/kiosk`);
console.log(`  Dashboard:  ${url}/admin   (first visit shows Create Owner Account)`);
console.log(`  Deployment: ${deployment.url}`);
console.log("\nSecrets (database password, auth secret) are in .deploy-state.json — keep it private.");
