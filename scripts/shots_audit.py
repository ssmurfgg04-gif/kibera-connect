"""Audit screenshots for VLM review rounds. Usage: python3 scripts/shots_audit.py <round>"""
import asyncio
import sys
from playwright.async_api import async_playwright

ROUND = sys.argv[1] if len(sys.argv) > 1 else "1"
BASE = "http://localhost:3000"
OUT = f"/home/z/my-project/assets/audit/round{ROUND}"

SECTIONS = [
    ("hero", "window.scrollTo(0,0)"),
    ("stats", "document.querySelector('main section:nth-of-type(2)')?.scrollIntoView({block:'start'})"),
    ("showcase", "document.getElementById('live')?.scrollIntoView({block:'start'})"),
    ("how", "document.querySelectorAll('main section')[3]?.scrollIntoView({block:'start'})"),
    ("impact", "document.querySelectorAll('main section')[4]?.scrollIntoView({block:'start'})"),
    ("footer", "window.scrollTo(0, document.body.scrollHeight)"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 960}, device_scale_factor=1.5)
        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_timeout(2200)
        for name, js in SECTIONS:
            try:
                await page.evaluate(js)
                await page.wait_for_timeout(1600)
                await page.screenshot(path=f"{OUT}/d-{name}.png")
            except Exception as e:
                print(name, "ERR", e)

        # showcase tabs
        try:
            await page.evaluate("document.getElementById('live')?.scrollIntoView({block:'start'})")
            await page.wait_for_timeout(800)
            await page.get_by_role("tab", name="Report").click()
            await page.wait_for_timeout(1400)
            await page.screenshot(path=f"{OUT}/d-report.png")
            await page.get_by_role("tab", name="The numbers").click()
            await page.wait_for_timeout(2000)
            await page.screenshot(path=f"{OUT}/d-numbers.png")
        except Exception as e:
            print("tabs ERR", e)

        mob = await browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1.5, is_mobile=True, has_touch=True)
        await mob.goto(BASE, wait_until="networkidle")
        await mob.wait_for_timeout(2200)
        await mob.screenshot(path=f"{OUT}/m-hero.png", full_page=False)
        await mob.screenshot(path=f"{OUT}/m-full.png", full_page=True)

        await browser.close()
        print("saved to", OUT)

asyncio.run(main())
