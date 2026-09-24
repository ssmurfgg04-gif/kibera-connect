"""Mobile segmented captures for review. Usage: python3 scripts/shots_mobile.py <round>"""
import asyncio
import sys
from playwright.async_api import async_playwright

ROUND = sys.argv[1] if len(sys.argv) > 1 else "1"
BASE = "http://localhost:3000"
OUT = f"/home/z/my-project/assets/audit/round{ROUND}"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_timeout(2500)

        heights = await page.evaluate("document.body.scrollHeight")
        print("page height:", heights)
        step = 800
        i = 0
        y = 0
        while y < heights and i < 14:
            await page.evaluate(f"window.scrollTo(0, {y})")
            await page.wait_for_timeout(900)
            await page.screenshot(path=f"{OUT}/m-seg{i:02d}.png")
            y += step
            i += 1
        await b.close()
        print("segments:", i)

asyncio.run(main())
