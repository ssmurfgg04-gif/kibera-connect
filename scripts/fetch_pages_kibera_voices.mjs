// fetch_pages_kibera_voices.mjs
// Fetch key article pages for Kibera voices research via z-ai-web-dev-sdk page_reader.
// Usage: node fetch_pages_kibera_voices.mjs
// Output: /home/z/my-project/scripts/out/pages/*.json

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve(process.cwd(), 'scripts/out/pages');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const URLS = [
  // Real stories / quotes
  'https://www.talkafrica.co.ke/kenyas-kibera-water-crisis-dry-taps-dirty-deals-long-queues-and-the-cost-of-survival/',
  'https://www.aljazeera.com/opinions/2017/4/3/how-deal-kiberas-flying-toilets',
  'https://infonile.org/en/2021/11/aerial-piped-water-improving-lives-in-kenyas-kibera-slum/',
  'https://www.bbc.com/news/world-africa-31540141',
  'https://www.voanews.com/a/power-at-any-cost-in-kenya-s-kibera-slum/3388304.html',
  'https://seattleglobalist.com/2013/04/24/poor-residents-push-back-government-housing-plans-kenya-slum',
  'https://www.one.org/africa/blog/why-residents-of-kibera-slum-are-rejecting-new-housing/',
  'https://www.pulitzercenter.org/stories/into-their-own-hands-kibera-kenyas-largest-slum',
  'https://www.nextcity.org/features/view/kibera-electricity-kenya-illegal-connections',
  'https://www.hrw.org/report/2017/04/05/going-toilet-when-you-want/sex-and-sanitation-informal-settlements-nairobi',
  'https://mg.co.za/article/2016-05-03-kiberas-flying-toilets-flushed-out-by-peepoo-bags/',
  'https://www.yahoo.com/news/kenyan-women-pay-price-slum-000000000.html',
  'https://www.talkafrica.co.ke/mama-mbogas-courage-breaking-the-cycle-of-gender-based-violence/',
  // Language
  'https://en.wikipedia.org/wiki/Sheng_slang',
  'https://www.sheng.co.ke/',
  'https://www.tuko.co.ke/314557-trending-sheng-words-meanings-50-terms.html',
  'https://explorepartsunknown.com/kenya/phrasebook/',
  // Ads
  'https://newsroom.safaricom.co.ke/media-center/press-releases/safaricom-launches-twaweza-a-new-brand-campaign.html',
  'https://ncbagroup.com/ncba-group-thematic-campaigns/',
  // Facts
  'https://en.wikipedia.org/wiki/Kibera',
  'https://journals.openedition.org/echogeo/13442',
  'https://www.wasreb.go.ke/majidata-system',
  'https://nairobiwater.co.ke/media-contacts/',
];

function htmlToText(html) {
  return (html || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

async function main() {
  const zai = await ZAI.create();
  const summary = [];
  for (const url of URLS) {
    const slug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 80);
    const file = path.join(OUT_DIR, slug + '.json');
    try {
      const result = await zai.functions.invoke('page_reader', { url });
      const text = htmlToText(result.data.html);
      fs.writeFileSync(file, JSON.stringify({ url, title: result.data.title, text }, null, 2));
      summary.push({ url, ok: true, title: result.data.title, chars: text.length, file });
      console.log('OK  ', url, '->', result.data.title, `(${text.length} chars)`);
    } catch (e) {
      summary.push({ url, ok: false, error: e.message });
      console.log('FAIL', url, '->', e.message);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  fs.writeFileSync(path.join(OUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
