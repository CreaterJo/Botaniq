import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to the homepage
    page.goto("http://localhost:3001")

    # Verify "Alle Pflanzen" link
    all_plants_link = page.locator('a[href="/all-plants"]')
    expect(all_plants_link).to_be_visible()
    all_plants_link.click()
    expect(page).to_have_url(re.compile(r"/all-plants"))
    page.screenshot(path="jules-scratch/verification/all_plants_page.png")

    # Go back to the homepage
    page.goto("http://localhost:3001")

    # Verify a category link
    category_link = page.get_by_role("link", name="Bäume")
    expect(category_link).to_be_visible()
    category_link.click()
    expect(page).to_have_url(re.compile(r"/category/B%C3%A4ume"))
    page.screenshot(path="jules-scratch/verification/category_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
