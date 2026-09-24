// research_kibera_round2.mjs
// Round 2 targeted searches: 50 shades of green, NDMA, more Sheng, Kenyan English, ad slogans.
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const QUERIES = {
  r2_quotes: [
    'Al Jazeera Kibera flying toilets "Don\'t step on any plastic" opinion 2017',
    'HRW "Going to the Toilet When You Want" Nairobi informal settlements quotes "sex for water"',
    'VOA "Power at Any Cost" Kibera "stima ya tokens" 1000 shillings deposit',
    'Pulitzer Center Kibera "into their own hands" villagers quotes settlement',
    '"Kibera" resident quote "we have no" toilet latrine interview news',
    'Kibera Soweto East KENSUP relocation residents quotes "Multi Storey Buildings"',
  ],
  r2_sheng: [
    'Sheng words "fiti" "poa" "safi" "vaa mtindo" meaning list',
    '"hakuna selector" meaning Kenya slang',
    'Sheng phrases "kuja flani" "kaa chonjo" "bamba" meaning',
    'Kenyan English phrases "you have been lost" "since time immemorial" "even me"',
    'Tuko sheng words list mtaa karau zamwa meanings',
    'Sheng "shamba" "chobo" "doe" "ganji" money words meaning',
    'Sheng word "mdosi" "boss" "ofisi" "kazi" meaning usage',
    'Nairobi matatu culture words "mathree" "nganya" "makanga"',
  ],
  r2_ads: [
    'Safaricom "Bamba 50" advert slogan Kenya',
    'Safaricom "Niko na Safaricom" tagline history',
    'M-Pesa "Send money home" advert Kenya slogan',
    'Kenya memorable adverts "Nindo" Superhero EABL "Chicken Inn" slogans',
    'Airtel Kenya advert slogans "Freedom" list',
    'Kenya Power KPLC advert slogan "Stima" campaigns',
  ],
  r2_facts: [
    '"50 shades of green" Kibera',
    'NDMA Kenya drought Kibera informal settlements water kiosk',
    'Kibera "50 Shades of Green" documentary photography rooftops',
    'SHOFCO water Kibera aerial pipes price 2 shillings facts',
    'Kibera rainwater "greywater" flooding El Nino toilets flooded statistics',
    'Kibera Open Streets "vertical slum" altitude 1660 metres above sea level',
  ],
};

async function main() {
  const zai = await ZAI.create();
  for (const [group, queries] of Object.entries(QUERIES)) {
    const all = [];
    for (const q of queries) {
      try {
        const results = await zai.functions.invoke('web_search', { query: q, num: 6 });
        console.log(`OK [${results.length}] ${q}`);
        all.push({ query: q, results });
      } catch (e) {
        console.error(`FAIL ${q}: ${e.message}`);
        all.push({ query: q, error: e.message });
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    fs.writeFileSync(`scripts/out/${group}.json`, JSON.stringify(all, null, 2));
  }
  console.log('done');
}
main().catch((e) => { console.error(e); process.exit(1); });
