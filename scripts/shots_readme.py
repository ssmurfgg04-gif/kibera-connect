"""Fresh README screenshots for KiberaConnect (desktop + mobile)."""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/home/z/my-project/docs/screenshots"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=f"{OUT}/hero.png")

        live = page.locator("#live")

        # Map tab is default. Scroll showcase into view and let tiles load.
        await page.evaluate("document.getElementById('live')?.scrollIntoView({block:'start'})")
        await page.wait_for_timeout(4500)
        await live.screenshot(path=f"{OUT}/map.png")

        # Report tab: click the tab button, then screenshot
        await page.get_by_role("tab", name="Report").click()
        await page.wait_for_timeout(1200)
        await live.screenshot(path=f"{OUT}/report.png")

        # Insights tab
        await page.get_by_role("tab", name="The numbers").click()
        await page.wait_for_timeout(2200)
        await live.screenshot(path=f"{OUT}/insights.png")

        # Mobile hero
        mob = await browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await mob.goto(BASE, wait_until="networkidle")
        await mob.wait_for_timeout(2500)
        await mob.screenshot(path=f"{OUT}/mobile.png")

        await browser.close()
        print("done")

asyncio.run(main())
