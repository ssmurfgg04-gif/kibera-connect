import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Kibera villages with approximate real coordinates (Kibera, Nairobi)
// Kibera bounding box: lat -1.330 to -1.305, lon 36.780 to 36.800
const VILLAGES: Record<string, { lat: number; lng: number }> = {
  Gatwekera: { lat: -1.3128, lng: 36.7864 },
  "Soweto West": { lat: -1.3182, lng: 36.7898 },
  Kianda: { lat: -1.3215, lng: 36.7882 },
  Lindi: { lat: -1.3145, lng: 36.7918 },
  "Kisumu Ndogo": { lat: -1.3162, lng: 36.7875 },
  Makina: { lat: -1.3105, lng: 36.7852 },
  Karanja: { lat: -1.3092, lng: 36.7898 },
  Olympic: { lat: -1.3062, lng: 36.7885 },
  "Laini Saba": { lat: -1.3118, lng: 36.7935 },
  Silanga: { lat: -1.3198, lng: 36.7952 },
  Mashimoni: { lat: -1.3138, lng: 36.7842 },
};

function jitter(v: { lat: number; lng: number }, seed: number) {
  const lat = v.lat + ((seed % 7) - 3) * 0.00042;
  const lng = v.lng + (((seed * 3) % 7) - 3) * 0.00042;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

type SeedIssue = {
  title: string;
  description: string;
  category: string;
  severity: string;
  village: string;
  status: string;
  upvotes: number;
  reporter: string;
  daysAgo: number;
  aiSummary: string;
  aiActions: string[];
  aiAffected: number;
  photoUrl?: string;
  updateMessage?: string;
};

const ISSUES: SeedIssue[] = [
  {
    title: "Water kiosk queue exceeds 4 hours at dawn",
    description:
      "The only functional water point in Gatwekera has a broken tap regulator, forcing over 300 households to queue from 4:30 AM. Many children miss school waiting in line. Vendors are now selling the same water at KSh 15 per 20L jerry can, triple the normal price.",
    category: "water",
    severity: "critical",
    village: "Gatwekera",
    status: "in_progress",
    upvotes: 148,
    reporter: "Amani O.",
    daysAgo: 3,
    photoUrl: "/images/pipe-before.jpg",
    aiSummary:
      "Critical water access failure affecting an estimated 300+ households. The 4-hour queue combined with price gouging (3x markup) indicates severe supply disruption. School absenteeism risk is high; immediate repair and interim distribution point recommended.",
    aiActions: [
      "Dispatch county water department technician for tap regulator repair within 48h",
      "Set up two interim distribution points at Gatwekera DC and near Toi Primary",
      "Flag price gouging to village elder council and Kenya Consumer Protection",
      "Schedule water bowser delivery every morning until repair confirmed",
    ],
    aiAffected: 1500,
    updateMessage:
      "Technician dispatched by Nairobi Water, interim bowser arriving daily at 6 AM.",
  },
  {
    title: "Sewer line burst flooding homes near railway",
    description:
      "A main sewage line burst two days ago near the railway path in Soweto West. Grey water is pooling between housing blocks; three families have been displaced. The smell is overwhelming and children play nearby, so the cholera risk is real.",
    category: "sanitation",
    severity: "critical",
    village: "Soweto West",
    status: "verified",
    upvotes: 203,
    reporter: "Grace W.",
    daysAgo: 2,
    aiSummary:
      "Active sewage overflow with displacement of 3 families. High cholera/typhoid outbreak potential given Kibera's density (~2,000 people per hectare in affected zones). Requires emergency containment plus health surveillance in adjacent compounds.",
    aiActions: [
      "Emergency cordon and sandbag containment around burst section",
      "Request Nairobi City County sewer repair crew , priority escalation",
      "Distribute aquatabs and hygiene kits to 40 adjacent households",
      "Alert Kibera health centres for acute watery diarrhea surveillance",
    ],
    aiAffected: 240,
    updateMessage: "Community health volunteers covering affected zone; county crew confirmed for tomorrow morning.",
  },
  {
    title: "Streetlight outages along Lindi footpath after dark",
    description:
      "All three streetlights on the main footpath from Lindi to the market have been dark for two weeks. Women walking home from evening market report harassment incidents. This path is used by hundreds every night.",
    category: "safety",
    severity: "high",
    village: "Lindi",
    status: "reported",
    upvotes: 96,
    reporter: "Anonymous",
    daysAgo: 1,
    photoUrl: "/images/alley.jpg",
    aiSummary:
      "Infrastructure-driven safety risk with reported harassment. Night-time economic activity and safe mobility for women are directly impacted. Quick-win fix: solar streetlights bypass the grid connection issue entirely.",
    aiActions: [
      "File joint request with County lighting department and area MCA office",
      "Install temporary solar floodlight at the market junction",
      "Organize community night patrol with boda riders until lights restored",
      "Document harassment reports with Ushahidi-linked GBV desk",
    ],
    aiAffected: 400,
  },
  {
    title: "Blocked drainage causing flash floods in Kianda",
    description:
      "The drainage channel behind Kianda market is completely blocked with plastic waste. Every rain event now floods five shops and the pedestrian passage. Last Sunday's rain put 30cm of muddy water through two dukas, destroying stock.",
    category: "environment",
    severity: "high",
    village: "Kianda",
    status: "in_progress",
    upvotes: 121,
    reporter: "Joseph M.",
    daysAgo: 6,
    aiSummary:
      "Recurring flood risk driven by solid-waste-blocked drainage. With long rains active, each rainfall event compounds economic loss for market traders. Clean-up plus waste collection point placement solves both flooding and waste management.",
    aiActions: [
      "Community clean-up day with provided gloves and collection bags",
      "Request county exhauster and grab-truck for channel desilting",
      "Place 4 waste collection drums at market entry points",
      "Introduce weekly youth-managed waste pickup with small stipend",
    ],
    aiAffected: 180,
    updateMessage: "Clean-up scheduled Saturday 8 AM; Kianda Youth Group leading with 40 volunteers.",
  },
  {
    title: "Dispensary out of first-line malaria medication",
    description:
      "Mashimoni dispensary has had no AL (artemether-lumefantrine) stock for nine days. Patients are being referred to Stoni Athi, which is 3km away. Mosquito season is peaking and the pharmacy menaces are buying stock at inflated prices.",
    category: "health",
    severity: "critical",
    village: "Mashimoni",
    status: "verified",
    upvotes: 176,
    reporter: "Nurse Faith A.",
    daysAgo: 2,
    aiSummary:
      "Essential medicine stockout at a primary care point during peak malaria transmission. Referral distance (3km) effectively denies treatment to low-mobility patients. Requires emergency resupply and interim distribution protocol.",
    aiActions: [
      "Emergency resupply request to Kenya Medical Supplies Authority (KEMSA)",
      "Activate KEMSA emergency allocation via sub-county health office",
      "Publish daily stock status at dispensary gate and via SMS groups",
      "Track referral outcomes to identify untreated patients",
    ],
    aiAffected: 800,
    updateMessage: "Sub-county office acknowledged; 3-day emergency allocation approved.",
  },
  {
    title: "Classroom roof torn off at Silanga primary school",
    description:
      "Tuesday's windstorm ripped off half the roof of the Standard 4 classroom at Silanga Primary. 62 pupils now sit under a tarpaulin. When it rains, lessons stop completely. Exams are in five weeks.",
    category: "education",
    severity: "high",
    village: "Silanga",
    status: "reported",
    upvotes: 88,
    reporter: "Teacher Daniel K.",
    daysAgo: 4,
    photoUrl: "/images/kids-wall.jpg",
    aiSummary:
      "School infrastructure damage directly interrupting learning for 62 pupils ahead of national exams. Temporary tarpaulin is not exam-grade resilience. Fastest path: sheet-metal repair kit plus local fundi labour within one week.",
    aiActions: [
      "Cost roof repair (iron sheets, timber, labour) , est. KSh 45,000",
      "Launch quick community fundraiser through churches and mosques",
      "Request NG-CDF bursary/infrastructure window for term repairs",
      "Rotate classes to church hall as interim weatherproof space",
    ],
    aiAffected: 62,
  },
  {
    title: "Transformer fault leaves Makina without power for 6 days",
    description:
      "The transformer serving Makina and parts of Karanja failed last Friday. Small businesses , posho mill, salons, phone charging shops , have lost income for almost a week. Food in fridges has spoiled.",
    category: "energy",
    severity: "high",
    village: "Makina",
    status: "in_progress",
    upvotes: 134,
    reporter: "Brian O.",
    daysAgo: 6,
    aiSummary:
      "Electrical infrastructure failure with direct livelihood impact on micro-enterprises. Six-day outage suggests transformer replacement rather than fuse reset. Kenya Power escalation plus business impact documentation strengthens claims for rapid action.",
    aiActions: [
      "Escalate token/reference number with Kenya Power regional office",
      "Document affected businesses for compensation/small business relief",
      "Coordinate shared generator point at Makina social hall",
      "Request MP office intervention through constituency office",
    ],
    aiAffected: 350,
    updateMessage: "Kenya Power crew assessed site; replacement transformer scheduled this week.",
  },
  {
    title: "Water pipe leak wasting supply for a week in Olympic",
    description:
      "A leaking connection near Olympic estate entrance has been spilling water continuously for over a week. Hundreds of litres going to waste every hour while Gatwekera has queues. Someone has even tapped an illegal connection downstream.",
    category: "water",
    severity: "medium",
    village: "Olympic",
    status: "reported",
    upvotes: 57,
    reporter: "Mercy N.",
    daysAgo: 8,
    aiSummary:
      "Non-revenue water loss from a distribution leak , both a waste and equity issue given simultaneous shortages elsewhere in Kibera. The reported illegal tap suggests broader network tampering requiring joint audit.",
    aiActions: [
      "Report leak reference to Nairobi Water with GPS pin",
      "Inspect and regularize suspected illegal connections downstream",
      "Calculate daily loss volume to prioritize repair in utility queue",
    ],
    aiAffected: 100,
  },
  {
    title: "Illegal dumping site beside children's playground",
    description:
      "Household waste is being dumped nightly beside the Soweto East playground. Kids still play there daily. Flies and smell have doubled in two weeks and one child was treated for a skin infection last week.",
    category: "environment",
    severity: "medium",
    village: "Soweto West",
    status: "verified",
    upvotes: 73,
    reporter: "Rose A.",
    daysAgo: 12,
    aiSummary:
      "Illegal dumpsite adjacent to child play area , combined environmental and child health hazard. Skin infection case suggests contamination pathway is active. Deterrence (lighting + signage) plus collection alternative addresses root cause.",
    aiActions: [
      "Install solar light and 'no dumping' signage with elder council backing",
      "Provide subsidized waste collection point within 200m radius",
      "Pediatric skin infection screening via community health volunteers",
      "Monthly clean-up rota with youth group ownership",
    ],
    aiAffected: 150,
    updateMessage: "Solar light installed; youth group starting weekly collection rota.",
  },
  {
    title: "Matatu stage relocation cutting off Kisumu Ndogo elderly",
    description:
      "After the matatu stage moved, the nearest stop for elderly residents of Kisumu Ndogo is now 1.2km away on a steep, unmaintained path. Several elderly residents are effectively homebound and missing clinic appointments.",
    category: "infrastructure",
    severity: "medium",
    village: "Kisumu Ndogo",
    status: "reported",
    upvotes: 41,
    reporter: "Samuel O.",
    daysAgo: 9,
    aiSummary:
      "Transport access change creating mobility exclusion for elderly residents, with healthcare appointment non-attendance as the immediate risk. Short-term: volunteer escort network; long-term: graded path maintenance.",
    aiActions: [
      "Negotiate one morning matatu stop return via sacco leadership",
      "Recruit boda riders for subsidized elderly transport on clinic days",
      "Path grading request to county public works with community labour",
    ],
    aiAffected: 60,
  },
  {
    title: "Fire risk from overloaded extension cords in Laini Saba",
    description:
      "After the power outage, dozens of households in Laini Saba are running daisy-chained extension cords from a few connected homes. Two near-fires reported this month. The last major Kibera fire destroyed hundreds of homes.",
    category: "safety",
    severity: "high",
    village: "Laini Saba",
    status: "in_progress",
    upvotes: 92,
    reporter: "Peter K.",
    daysAgo: 5,
    aiSummary:
      "Fire risk escalation via unsafe electrical practice following outage , recalling Kibera's catastrophic fire history, this is a prevention-critical situation. Combined education + safe metered connection options can defuse quickly.",
    aiActions: [
      "Door-to-door fire safety sensitization with community health promoters",
      "Place fire extinguishers and trained volunteers at 3 hotspot points",
      "Engage Kenya Power on temporary safe connection amnesty",
      "Stock fire-break grass clearing along high-risk lanes",
    ],
    aiAffected: 500,
    updateMessage: "Extinguishers placed at 2 of 3 hotspots; sensitization reaching 180 households.",
  },
  {
    title: "Toilet block overflowing at Gatwekera market",
    description:
      "The public toilet serving Gatwekera market has not been emptied in two weeks. It is overflowing towards food stalls. Traders are losing customers and there is a constant health hazard for the hundreds who use the market daily.",
    category: "sanitation",
    severity: "high",
    village: "Gatwekera",
    status: "reported",
    upvotes: 110,
    reporter: "Halima S.",
    daysAgo: 3,
    aiSummary:
      "Public sanitation failure with direct food-safety and market-economy impact. Overflow toward food stalls creates fecal-oral transmission risk in a high-traffic zone. Exhauster dispatch plus pit maintenance fund prevents recurrence.",
    aiActions: [
      "Emergency exhauster request to county sanitation team",
      "Establish trader-run toilet maintenance fee (KSh 5) for regular servicing",
      "Food stall relocation guidance during overflow period",
      "Handwashing station with soap at market entrance immediately",
    ],
    aiAffected: 300,
  },
  {
    title: "Borehole pump broken in Karanja , 500 households affected",
    description:
      "The community borehole serving Karanja has had its pump broken since last Monday. The water committee says repair needs KSh 28,000 for a new pump and installation. Households are walking to Soweto West for water.",
    category: "water",
    severity: "high",
    village: "Karanja",
    status: "in_progress",
    upvotes: 158,
    reporter: "Water Committee Chair",
    daysAgo: 7,
    aiSummary:
      "Community water infrastructure failure with clear, low-cost repair path (KSh 28,000). Distance burden shifts to already-stressed Soweto West points. Crowdfund + county emergency fund can close gap within days.",
    aiActions: [
      "Launch targeted crowdfund via mobile money paybill with daily progress posts",
      "Request emergency allocation from constituency development fund",
      "Get 3 quotes from verified pump suppliers to prevent overpricing",
      "Interim bowser schedule every second day until pump restored",
    ],
    aiAffected: 2000,
    updateMessage: "KSh 19,400 raised of 28,000 , 69% funded. Bowser arriving alternate days.",
  },
  {
    title: "Flooded pit latrines near Toi riverbank after heavy rain",
    description:
      "Three pit latrines near the riverbank in Lindi flooded during Sunday night's rain and collapsed partially. The contents drained toward the river where children fetch water for washing. Immediate danger of contamination downstream.",
    category: "sanitation",
    severity: "critical",
    village: "Lindi",
    status: "verified",
    upvotes: 187,
    reporter: "Anonymous",
    daysAgo: 1,
    aiSummary:
      "Collapsed latrines with visible fecal contamination pathway to a community-used river section , acute public health emergency. Combined containment, water-point closure, and health monitoring required in the next 24-48 hours.",
    aiActions: [
      "Cordon area and post water-use prohibition notices immediately",
      "Emergency exhauster + backfill of collapsed pits",
      "Free chlorine testing at 3 downstream fetch points daily for a week",
      "Register affected households for aquatab distribution",
    ],
    aiAffected: 400,
    updateMessage: "Area cordoned; exhauster scheduled; aquatabs reaching 150 households today.",
  },
  {
    title: "Broken footbridge isolating Silanga from schools",
    description:
      "The wooden footbridge over the drainage channel to Silanga collapsed after last week's floods. About 200 children now take a 40-minute detour through traffic to reach school, and some have started skipping classes.",
    category: "infrastructure",
    severity: "high",
    village: "Silanga",
    status: "reported",
    upvotes: 99,
    reporter: "Mary J.",
    daysAgo: 10,
    aiSummary:
      "Connectivity loss with direct education impact , absenteeism already measurable. Steel truss footbridge with community labour is a proven, fast model in Kibera (precedent: Kibera Public Space projects).",
    aiActions: [
      "Emergency temporary crossing with sandbags and planks, guarded",
      "Request Kounkuey Design Initiative / county partnership for steel bridge",
      "Attendance monitoring by head teachers to flag dropouts early",
      "Community labour pledge meeting for build week",
    ],
    aiAffected: 200,
  },
  {
    title: "Measles vaccination drive missing out-of-school children",
    description:
      "The current measles vaccination drive is running only from fixed clinic sites. Out-of-school children and those whose parents work all day are missing it. Community health workers say coverage in Mashimoni may be under 50%.",
    category: "health",
    severity: "high",
    village: "Mashimoni",
    status: "in_progress",
    upvotes: 64,
    reporter: "CHW Deborah",
    daysAgo: 4,
    photoUrl: "/images/volunteers.jpg",
    aiSummary:
      "Vaccination coverage gap concentrated in hard-to-reach children. Outbreak risk scales with every uncovered pocket in dense settlement. Mobile outreach + evening/weekend sessions close the gap fast.",
    aiActions: [
      "Deploy mobile outreach teams to 5 Mashimoni zones this week",
      "Add evening and Saturday vaccination sessions at churches/mosques",
      "Village elder announcements plus SMS reminder blast",
      "Track daily coverage by zone to target remaining pockets",
    ],
    aiAffected: 300,
    updateMessage: "Mobile teams reached 2 zones; 114 children vaccinated in 3 days.",
  },
  {
    title: "Solid waste pile attracting rodents near food kiosks",
    description:
      "A growing garbage pile behind the Olympic food kiosks has not been collected in three weeks. Rats are now seen during business hours. Traders worry about leptospirosis and losing customers.",
    category: "environment",
    severity: "medium",
    village: "Olympic",
    status: "reported",
    upvotes: 48,
    reporter: "Traders Association",
    daysAgo: 15,
    aiSummary:
      "Uncollected waste creating rodent vector risk adjacent to food business zone. Standard non-collection cycle suggests service gap rather than one-off miss. Collection catch-up plus trap-and-bait protocol needed.",
    aiActions: [
      "Request immediate catch-up collection from county waste team",
      "Rodent baiting protocol with safety signage by public health officers",
      "Kiosk waste levy for guaranteed twice-weekly collection",
    ],
    aiAffected: 80,
  },
  {
    title: "Youth centre computer lab lacks power backup",
    description:
      "The free digital skills classes at the Soweto youth centre stop every time there is an outage , which is now frequent. With 120 youth enrolled and outages lasting days, classes are cancelled more than they run.",
    category: "education",
    severity: "low",
    village: "Soweto West",
    status: "reported",
    upvotes: 37,
    reporter: "Instructor Kevin",
    daysAgo: 6,
    aiSummary:
      "Education continuity blocked by power reliability , a solvable resilience gap. A mid-size inverter/battery bank (~KSh 60,000) would carry the lab through typical outage windows and protect equipment too.",
    aiActions: [
      "Cost inverter + battery bank sized for 10 machines",
      "Approach solar companies for CSR equipment donation",
      "Shift class schedule toward typically stable morning hours",
    ],
    aiAffected: 120,
  },
];

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
  const resolved = [
    {
      title: "Water tank installed at Soweto West primary school",
      description:
        "Follow-up: the 10,000L tank funded through this platform is installed and serving 700 pupils with clean water daily. Attendance improved and the school closed its own queue at the gate.",
      village: "Soweto West",
      upvotes: 231,
      daysAgo: 21,
    },
    {
      title: "Solar streetlights restored along Kisumu Ndogo lane",
      description:
        "All four solar streetlights on the Kisumu Ndogo main lane are repaired and working. Night market vendors extended their hours and residents report safer evening walks.",
      village: "Kisumu Ndogo",
      upvotes: 195,
      daysAgo: 28,
    },
  ];
  for (let i = 0; i < resolved.length; i++) {
    const r = resolved[i];
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
