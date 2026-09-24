import { db } from "../src/lib/db";
import { compareReports, diagnosticTerms, textSimilarity, words } from "../src/lib/triage";

async function main() {
  const issues = await db.issue.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  const test = "The street lights on the footpath to the market are all dead, it is very dark at night";
  const target = issues.find((i) => i.title.toLowerCase().includes("streetlight")) ?? issues[0];
  console.log("target:", target.title);
  console.log("target desc:", target.description);
  console.log("target coords:", target.latitude, target.longitude);
  console.log("target words:", words(target.description).join(","));
  console.log("target diag:", [...diagnosticTerms(target.description)].join(","));
  console.log("test words:", words(test).join(","));
  console.log("test diag:", [...diagnosticTerms(test)].join(","));
  const v = compareReports(
    { description: test, latitude: -1.3141, longitude: 36.7895 },
    { description: target.description, latitude: target.latitude, longitude: target.longitude }
  );
  console.log("verdict:", JSON.stringify(v));
}
main().catch(console.error);
