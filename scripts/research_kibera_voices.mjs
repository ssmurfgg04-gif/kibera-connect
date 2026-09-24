// research_kibera_voices.mjs
// Research real Kibera resident voices, Sheng language, Kenyan campaign voice, and Kibera facts.
// Usage: node /home/z/my-project/scripts/research_kibera_voices.mjs [group]
//   group = quotes | sheng | ads | facts | all (default all)
// Output: /home/z/my-project/scripts/out/*.json

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve(process.cwd(), 'scripts/out');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const GROUPS = {
  quotes: [
    '"Kibera resident" water shortage quote interview',
    'Kibera sanitation "flying toilets" resident quotes Human Rights Watch',
    'reddit r/Kenya Kibera water shortage experience',
    'Kibera slum upgrading resident quotes news interview',
    'site:bbc.com Kibera residents quotes water',
    'site:theguardian.com Kibera residents interview quotes',
    '"flying toilets" Kibera story residents',
    'Kibera youth boda boda mama mboga daily life story',
    'TOI market sewage Kibera traders quotes',
    'Kibera Lindi Gatwekera Soweto West village water sewage residents speak',
    'Kibera electricity power outage illegal connections residents quotes',
    'Kibera garbage collection residents complain quotes news',
    'Kibera woman interview water vendor jerrycan price',
    'Amnesty International Kibera forced evictions residents quotes',
  ],
  sheng: [
    'common Sheng words list meanings Kenya',
    'Kenyan slang Sheng phrases 2024',
    'Sheng dictionary msee wasee braza mtaa meaning',
    'Kenyan English phrases unique "you have been lost"',
    'Sheng words money chapaa doe kes',
    'how Nairobi youth speak Sheng examples conversation',
    'mama mboga boda boda meaning Kenya daily life words',
    'Sheng greetings sasa poa vipi fiti',
  ],
  ads: [
    'Safaricom Twaweza campaign slogan Kenya',
    'NCBA "numbers that matter" campaign Kenya',
    'Kenyan advert taglines Swahili punchy',
    'Kenya advertising copywriting Swahili English mix brands',
    'Safaricom M-Pesa advertising slogans list Kenya',
    'Kenyan billboard slogans examples brands Nairobi',
  ],
  facts: [
    'Kibera population estimate official census 2019 commonly cited figures',
    'Kibera number of villages list Gatwekera Soweto Lindi Kianda',
    'Kibera toilet ratio pit latrine one toilet per people statistics',
    'Kibera water access percentage households piped water statistics',
    'Kibera average income per day residents statistics',
    'MajiData Nairobi low income water data Kibera',
    'Nairobi Water and Sewerage Company official name contacts complaints',
    'Nairobi City Water sewerage department report water loss non revenue',
    'Kibera railway line 50 shades of green altitude 1660m largest urban slum Africa facts',
    'Kibera electricity connections illegal connections percentage survey',
  ],
};

async function main() {
  const groupArg = process.argv[2] || 'all';
  const groupsToRun = groupArg === 'all' ? Object.keys(GROUPS) : [groupArg];
  const zai = await ZAI.create();

  for (const group of groupsToRun) {
    const queries = GROUPS[group];
    console.log(`\n=== GROUP: ${group} (${queries.length} queries) ===`);
    const all = [];
    for (const q of queries) {
      try {
        const results = await zai.functions.invoke('web_search', { query: q, num: 8 });
        console.log(`OK [${results.length}] ${q}`);
        all.push({ query: q, results });
      } catch (e) {
        console.error(`FAIL ${q}: ${e.message}`);
        all.push({ query: q, error: e.message });
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    const file = path.join(OUT_DIR, `${group}.json`);
    fs.writeFileSync(file, JSON.stringify(all, null, 2));
    console.log(`saved -> ${file}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
