# KiberaConnect

**Report it. Follow it. Get it fixed.**

A community proof engine for Kibera, Nairobi. See a broken pipe, a dead
streetlight, an open sewer. Take one photo. KiberaConnect finds everyone
else affected, makes noise on your behalf, and keeps the status public
until someone shows up and fixes it.

The water pipe broke three weeks ago. Nobody came. That is the problem
this project exists to end.

## How the loop works

1. **You see it. You snap it.** One photo, a few words in English,
   Kiswahili or Sheng. GPS tags itself. No account, 30 seconds.
2. **We make noise.** Your report joins every other report from your
   street. Fifty people reporting the same pipe is not fifty complaints,
   it is one work order the county cannot ignore.
3. **Someone shows up.** AI triage scores severity with Kibera context,
   estimates who is affected, and drafts the action plan. The status
   stays public from the first photo to the last wrench.

## What is inside

- **Next.js 16** (App Router) + TypeScript + Tailwind 4
- **Prisma + SQLite**, pre-seeded with 20 realistic reports across 11
  Kibera villages (Gatwekera, Lindi, Soweto West, Kisumu Ndogo, Makina,
  Silanga and more)
- **Live map** with Leaflet + OpenStreetMap, severity markers and
  community feed with filters
- **AI triage** endpoint that classifies the issue, scores severity with
  local nuance, estimates affected residents and proposes concrete next
  actions that name real local actors (Nairobi Water, CHV networks,
  village elder councils, the area MCA office)
- **Insights dashboard**: category breakdown, response pipeline,
  14-day momentum, village leaderboard
- **Dusty Morning design system**: red earth after rain, 6 AM sun
  through corrugated iron, Nairobi sky teal. Space Grotesk for display,
  Inter for body, Caveat for the pen notes. Sharp corners, honest
  borders, no glassmorphism.

## Run it locally

```bash
npm install
npx prisma generate && npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

Open http://localhost:3000

## Deploy to Netlify

The repo ships with `netlify.toml` and the official
`@netlify/plugin-nextjs` runtime.

1. Push this repo to GitHub.
2. In Netlify: **Add new site, Import an existing project**, pick the repo.
3. Netlify reads `netlify.toml` and does the rest. The build seeds the
   SQLite database into the function bundle; `src/lib/db.ts` copies it
   to writable `/tmp` at cold start.
4. For production-grade persistence, swap `prisma/schema.prisma` to a
   Postgres provider (Neon has a free tier) and drop the `/tmp` copy
   logic in `src/lib/db.ts`.

## On the numbers

- 31.6% of Kibra households get water piped to their plot (KNBS)
- KSh 5 per visit to a shared toilet for the 96% without one at home
  (Kim et al. 2022)
- Roughly 250,000 neighbours across 13 villages (Map Kibera count;
  the 2019 census says fewer, old UN-Habitat figures say more. We pick
  the defensible middle and cite it.)

## Built for

Hack for Humanity: Nairobi. Built with Kibera, not just for it. Twaweza.
