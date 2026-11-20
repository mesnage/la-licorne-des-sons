"""World changes must not keep earlier scenes alive (each retained scene costs well over 100 MB in Safari).

Needs the local server and Chromium (uses the DevTools protocol to count live documents after a forced GC).
python3 tools/test-world-memory-browser.py [--url http://127.0.0.1:8080] [--browser-path /usr/bin/chromium]
"""
import argparse
from playwright.sync_api import sync_playwright
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--browser-path', default='/usr/bin/chromium')
args = parser.parse_args()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=2)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(args.url + '/?debug', wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready', timeout=60000)
    cdp = page.context.new_cdp_session(page)

    def counters():
        page.wait_for_timeout(1200)
        for _ in range(3):
            cdp.send('HeapProfiler.collectGarbage')
        return cdp.send('Memory.getDOMCounters')

    start = counters()
    seen = []
    for theme in [1, 2, 3, 10, 5, 0, 6, 1]:
        assert page.evaluate('id => window.__adventure.setTheme(id)', theme)
        page.wait_for_function('id => window.__adventure.state().world.theme === id && window.__adventure.state().world.ready', arg=theme, timeout=60000)
        seen.append(counters())
        assert page.locator('iframe.painted-scene').count() == 1
    documents = [c['documents'] for c in seen]
    assert max(documents) <= start['documents'] + 1, ('earlier scenes are still in memory', start['documents'], documents)
    assert seen[-1]['nodes'] < start['nodes'] * 2.5, (start['nodes'], [c['nodes'] for c in seen])
    assert not errors, errors
    browser.close()
print('World memory checks passed:', start['documents'], '->', documents)
