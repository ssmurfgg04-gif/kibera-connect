"""Final regression: analyze -> submit -> done; joined flow; verify new issue appears."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1440, "height": 1000})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.get_by_role("tab", name="Report").click()
        await page.wait_for_timeout(800)

        await page.fill("#rf-title", "Broken water pipe flooding the Lindi market path")
        await page.fill("#rf-desc", "A pipe has burst near the market path in Lindi and water has been running since morning. The path is muddy and children going to school are walking through dirty water.")
        await page.wait_for_timeout(2200)  # let dedup check (should NOT match streetlight)
        dedup_visible = await page.get_by_text("You are not the only one").count()
        print("dedup card visible (expect 0):", dedup_visible)

        await page.get_by_role("radio", name="Water").click()
        await page.get_by_role("button", name="Analyze with AI").click()
        try:
            await page.wait_for_selector("text=AI Triage", timeout=30000)
            print("AI triage: shown")
        except Exception:
            print("AI triage: fallback used or slow")
        await page.screenshot(path="/tmp/final-analyzed.png")
        await page.get_by_role("button", name="Post to community map").click()
        try:
            await page.wait_for_selector("text=Asante sana! Report posted.", timeout=15000)
            print("submit: done screen OK")
        except Exception:
            print("submit: FAILED")
        await page.wait_for_timeout(3000)
        await page.get_by_role("tab", name="The map").click()
        await page.wait_for_timeout(2500)
        count = await page.get_by_text("Broken water pipe flooding the Lindi market path", exact=False).count()
        print("new issue on map/feed:", count)
        await b.close()

asyncio.run(main())
