from playwright.sync_api import sync_playwright

url = "https://www.leobrain.com"

with sync_playwright() as p:
    # --- Chromium ---
    print("Launching Chromium...")
    chromium = p.chromium.launch(headless=False)  # headless=True to run in background
    page = chromium.new_page()
    page.goto(url)
    print("Chromium title:", page.title())
    chromium.close()

    # --- Firefox ---
    print("\nLaunching Firefox...")
    firefox = p.firefox.launch(headless=False)
    page = firefox.new_page()
    page.goto(url)
    print("Firefox title:", page.title())
    firefox.close()

    # --- WebKit ---
    print("\nLaunching WebKit...")
    webkit = p.webkit.launch(headless=False)
    page = webkit.new_page()
    page.goto(url)
    print("WebKit title:", page.title())
    webkit.close()

