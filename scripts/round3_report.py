"""Round 3: exercise the report flow, trigger the dedup card, capture states."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1440, "height": 960})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.evaluate("document.getElementById('live')?.scrollIntoView({block:'start'})")
        await page.get_by_role("tab", name="Report").click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/tmp/r3-report-empty.png")

        # Fill title + a description that should trip the dedup (Lindi streetlights)
        await page.fill("#rf-title", "Streetlights dead on Lindi footpath")
        await page.fill("#rf-desc", "The street lights on the footpath to the market are all dead, it is very dark at night near Lindi.")
        await page.wait_for_timeout(2200)  # debounce 700ms + fetch
        await page.evaluate("document.getElementById('report-panel')?.scrollIntoView({block:'start'})")
        await page.wait_for_timeout(600)
        await page.screenshot(path="/tmp/r3-report-dedup.png")

        # click Safety category
        await page.get_by_role("radio", name="Safety").click()
        await page.wait_for_timeout(400)
        await page.screenshot(path="/tmp/r3-report-filled.png")
        await b.close()
asyncio.run(main())
