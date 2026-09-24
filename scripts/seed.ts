import { PrismaClient } from "@prisma/client";
import { VILLAGES, jitter, ISSUES, RESOLVED } from "../src/lib/seed-data";

const db = new PrismaClient();

async function main() {
  console.log("Seeding KiberaConnect database...");
  await db.issueUpdate.deleteMany();
  await db.issue.deleteMany();

  for (let i = 0; i < ISSUES.length; i++) {
    const issue = ISSUES[i];
    const v = VILLAGES[issue.village] ?? { lat: -1.313, lng: 36.789 };
    const loc = jitter(v, i + 2);
    const createdAt = new Date(Date.now() - issue.daysAgo * 24 * 3600 * 1000 - i * 3600 * 1000);

    const created = await db.issue.create({
      data: {
        title: issue.title,
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
        village: issue.village,
        latitude: loc.lat,
        longitude: loc.lng,
        reporterName: issue.reporter,
        isAnonymous: issue.reporter === "Anonymous",
        status: issue.status,
        photoUrl: issue.photoUrl ?? null,
        aiSummary: issue.aiSummary,
        aiActions: JSON.stringify(issue.aiActions),
        aiAffected: issue.aiAffected,
        upvotes: issue.upvotes,
        createdAt,
        updatedAt: createdAt,
      },
    });

    if (issue.updateMessage) {
      await db.issueUpdate.create({
        data: {
          issueId: created.id,
          message: issue.updateMessage,
          status: issue.status,
          author: "Community Response Team",
          createdAt: new Date(createdAt.getTime() + 12 * 3600 * 1000),
        },
      });
    }
  }

  // A couple of resolved showcases
  for (let i = 0; i < RESOLVED.length; i++) {
    const r = RESOLVED[i];
    const v = VILLAGES[r.village];
    const loc = jitter(v, i + 11);
    await db.issue.create({
      data: {
        title: r.title,
        description: r.description,
        category: i === 0 ? "water" : "safety",
        severity: "medium",
        village: r.village,
        latitude: loc.lat,
        longitude: loc.lng,
        reporterName: "Community Response Team",
        status: "resolved",
        photoUrl: i === 0 ? "/images/pipe-after.jpg" : null,
        aiSummary:
          "Resolution confirmed through community verification. Impact metrics captured for transparency reporting.",
        aiActions: JSON.stringify(["Verify impact with beneficiary interviews", "Publish resolution report to platform"]),
        aiAffected: i === 0 ? 700 : 350,
        upvotes: r.upvotes,
        createdAt: new Date(Date.now() - r.daysAgo * 24 * 3600 * 1000),
      },
    });
  }

  const total = await db.issue.count();
  console.log(`Seeded ${total} issues across ${Object.keys(VILLAGES).length} villages.`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
