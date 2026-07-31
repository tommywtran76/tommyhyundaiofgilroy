import { prisma } from "./db";
import { SCHEMA_SQL } from "./schema-sql";

// First-run auto-migration: if the database is empty (fresh Neon/Supabase
// instance attached in the Vercel dashboard), create the schema so no SQL
// editor or terminal is ever needed. Runs at most once per server instance
// and is a no-op when the tables already exist.

let ensured: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = ensure().catch((err) => {
      ensured = null; // allow retry on the next request
      throw err;
    });
  }
  return ensured;
}

async function ensure(): Promise<void> {
  try {
    await prisma.$queryRawUnsafe(`select 1 from "User" limit 1`);
    return; // schema already present
  } catch {
    // Table missing — create the schema below.
  }

  console.log("First run: creating database schema…");
  const statements = SCHEMA_SQL
    // strip line comments so a comment containing ';' can't break splitting
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Tolerate concurrent first-requests racing each other.
      if (!/already exists/i.test(msg)) throw err;
    }
  }
  console.log(`Database schema created (${statements.length} statements).`);
}
