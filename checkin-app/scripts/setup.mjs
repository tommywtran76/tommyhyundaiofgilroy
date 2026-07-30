// One-command local setup: creates .env (with a fresh AUTH_SECRET) if missing,
// creates the SQLite database, and seeds logins + sample data.
//   npm run setup
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (!existsSync(".env")) {
  const template = readFileSync(".env.example", "utf8");
  const secret = randomBytes(32).toString("hex");
  const env = template.replace('AUTH_SECRET=""', `AUTH_SECRET="${secret}"`);
  writeFileSync(".env", env);
  console.log("Created .env with a generated AUTH_SECRET.");
} else {
  console.log(".env already exists — leaving it untouched.");
}

run("npx prisma db push");
run("npx tsx prisma/seed.ts");

console.log("\nSetup complete. Start the app with:  npm run dev");
console.log("Kiosk:      http://localhost:3000/kiosk");
console.log("Dashboard:  http://localhost:3000/admin");
