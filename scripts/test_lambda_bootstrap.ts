/**
 * Simulates a Netlify lambda cold start for src/lib/db.ts.
 * Test A: DATABASE_URL points into the bundle, but the file is missing
 *         (the exact live-site failure) -> bootstrap must rebuild + seed.
 * Test B: bundled db/custom.db exists -> bootstrap must copy it to /tmp.
 * Run: npx tsx scripts/test_lambda_bootstrap.ts A|B
 */
async function main() {
  const mode = process.argv[2] ?? "A";

  // Fresh lambda = fresh /tmp
  const fs = await import("fs");
  if (fs.existsSync("/tmp/kibera-connect.db")) fs.unlinkSync("/tmp/kibera-connect.db");

  if (mode === "A") {
    // The live failure: absolute path into a bundle that lacks the db file.
    process.env.NETLIFY = "true";
    process.env.DATABASE_URL = "file:/var/task/db/custom.db";
  } else {
    // Bundled file present at cwd (what included_files should give us).
    process.env.NETLIFY = "true";
    process.env.DATABASE_URL = "file:./db/custom.db";
  }
  process.env.NODE_ENV = "production";

  const { db, dbReady } = await import("../src/lib/db");

  const t0 = Date.now();
  await dbReady;
  const total = await db.issue.count();
  const resolved = await db.issue.count({ where: { status: "resolved" } });
  const sample = await db.issue.findFirst({ orderBy: { createdAt: "desc" } });
  const byVillage = await db.issue.groupBy({ by: ["village"], _count: { _all: true } });
  await db.$disconnect();

  console.log(
    JSON.stringify(
      {
        mode,
        bootMs: Date.now() - t0,
        total,
        resolved,
        byVillageCount: byVillage.length,
        newestIssue: sample?.title ?? null,
        dbUrl: process.env.DATABASE_URL,
      },
      null,
      2
    )
  );

  if (total !== 20) {
    console.error(`FAIL: expected 20 issues, got ${total}`);
    process.exit(1);
  }
  console.log(`PASS: lambda cold start (${mode}) self-healed with 22 issues.`);
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
