"""Round 7: photo evidence + join-existing voice flow, desktop + mobile."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Desktop: feed thumbnails + detail card with photo
        page = await b.new_page(viewport={"width": 1440, "height": 1000})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.evaluate("document.getElementById('live')?.scrollIntoView({block:'start'})")
        await page.wait_for_timeout(1200)
        await page.screenshot(path="/tmp/r7-feed-photo.png")
        # open the first issue (streetlight, has photo)
        await page.get_by_text("Streetlight outages along Lindi footpath", exact=False).first.click()
        await page.wait_for_timeout(1800)
        await page.screenshot(path="/tmp/r7-detail-photo.png")

        # Mobile: voice + dedup + join flow
        mob = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await mob.goto("http://localhost:3000", wait_until="networkidle")
        await mob.wait_for_timeout(2200)
        await mob.get_by_role("tab", name="Report").click()
        await mob.wait_for_timeout(800)
        await mob.fill("#rf-title", "Streetlights dead on Lindi footpath")
        await mob.fill("#rf-desc", "The street lights on the footpath to the market are all dead, it is very dark at night near Lindi.")
        await mob.wait_for_timeout(2400)
        await mob.evaluate("document.getElementById('report-panel')?.scrollIntoView({block:'start'})")
        await mob.wait_for_timeout(500)
        await mob.screenshot(path="/tmp/r7-mobile-dedup.png")
        # join the existing report
        await mob.get_by_role("button", name="Add my voice to theirs").click()
        await mob.wait_for_timeout(1400)
        await mob.screenshot(path="/tmp/r7-mobile-joined.png")
        await b.close()
        print("done")

asyncio.run(main())
