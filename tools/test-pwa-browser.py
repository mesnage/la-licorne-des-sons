"""Installable web app: install, offline start, offline activity, kept voices and update pickup.

Starts its own local server so it can be stopped to simulate a device without network.
python3 tools/test-pwa-browser.py [--port 8790] [--browser-path /usr/bin/chromium]
"""
import argparse, json, subprocess, sys, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8790)
parser.add_argument('--browser-path', default='/usr/bin/chromium')
args = parser.parse_args()
BASE = f'http://127.0.0.1:{args.port}'

def serve():
    server = subprocess.Popen([sys.executable, str(ROOT / 'tools/serve.py'), '--port', str(args.port)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try:
            urllib.request.urlopen(BASE + '/favicon.svg', timeout=1).close(); return server
        except Exception:
            time.sleep(.1)
    server.kill(); raise SystemExit('local server did not start')

def stop(server):
    server.terminate(); server.wait(timeout=5)

def boot(page, path='/?debug&pwa=1'):
    page.goto(BASE + path, wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready', timeout=30000)

expected = json.loads((ROOT / 'js/pwa-files.js').read_text(encoding='utf-8').split('self.LICORNE_PWA = ', 1)[1].rstrip().rstrip(';'))
manifest = json.loads((ROOT / 'audio/manifest.json').read_text(encoding='utf-8'))
voice = next((name for name in manifest.values() if (ROOT / 'audio' / name).is_file()), None)
marker = ROOT / 'css/chapters.css'
original = marker.read_bytes()
server = serve()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.browser_path, headless=True, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, reduced_motion='reduce')
        page = context.new_page(); errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        # Without the opt-in, automated suites keep running uncached.
        boot(page, '/?debug')
        page.wait_for_timeout(500)
        assert page.evaluate('navigator.serviceWorker.getRegistrations().then(list => list.length)') == 0

        # Install: the worker takes control and keeps the whole game shell.
        boot(page)
        page.evaluate('navigator.serviceWorker.ready.then(() => new Promise(done => navigator.serviceWorker.controller ? done() : navigator.serviceWorker.addEventListener("controllerchange", done, {once:true})))')
        kept = page.evaluate('caches.open("licorne-shell-v2-' + expected['version'] + '").then(cache => cache.keys()).then(keys => keys.map(key => new URL(key.url).pathname.slice(1)))')
        assert sorted(kept) == sorted(expected['files']), sorted(set(expected['files']) ^ set(kept))
        assert any(name.endswith('.mp3') for name in kept)
        info = page.evaluate('fetch("manifest.webmanifest").then(response => response.json())')
        assert info['display'] == 'standalone' and info['lang'] == 'fr'
        assert page.locator('link[rel="manifest"]').count() == 1 and page.locator('link[rel="apple-touch-icon"]').count() == 1

        # Parents' help offers installation; without a browser install prompt it explains the gesture.
        page.locator('.adventure-help summary').click()
        assert page.locator('#installButton').is_visible() and page.locator('#installSteps').is_hidden()
        page.locator('#installButton').click()
        page.wait_for_function('!document.getElementById("installSteps").hidden || matchMedia("(display-mode: standalone)").matches')
        apple = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
        phone = apple.new_page(); phone.goto(BASE + '/?debug', wait_until='domcontentloaded'); phone.wait_for_function('window.__adventure?.state().ready', timeout=30000)
        phone.locator('.adventure-help summary').click(); phone.locator('#installButton').click()
        assert 'Partager' in phone.locator('#installSteps').inner_text()
        fits = phone.evaluate('(() => { const b = document.getElementById("installApp").getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; })()')
        phone.wait_for_timeout(300)
        seen = phone.evaluate('(() => { const b = document.getElementById("installSteps").getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight + 1; })()')
        assert fits and seen
        phone.screenshot(path='/tmp/pwa-install-help.png'); apple.close()

        # A voice heard once stays on the device.
        boot(page)
        if voice:
            assert page.evaluate('name => fetch("audio/" + name).then(response => response.ok)', voice)
            page.wait_for_function('name => caches.open("licorne-media-v1").then(cache => cache.match(new URL("audio/" + name, location.href).href)).then(Boolean)', arg=voice)

        # Online, an edited file is served fresh (network first), so updates never need a manual refresh.
        marker.write_bytes(original + b'\n/* pwa-update-probe */\n')
        assert 'pwa-update-probe' in page.evaluate('fetch("css/chapters.css?v=anything").then(response => response.text())')
        marker.write_bytes(original)
        assert 'pwa-update-probe' not in page.evaluate('fetch("css/chapters.css").then(response => response.text())')

        # No network at all: the game still starts, an activity still opens, every page still loads.
        stop(server); server = None
        boot(page)
        assert page.locator('[data-chapter]').count() == 4
        page.locator('[data-chapter]').first.click(no_wait_after=True)
        page.locator('#adventureModules > button:visible').first.click(no_wait_after=True)
        page.wait_for_function('window.__adventure.state().phase === "question"', timeout=30000)
        assert page.locator('#adventureChoices button').count() >= 2
        if voice:
            assert page.evaluate('name => fetch("audio/" + name).then(response => response.ok)', voice)
        assert page.evaluate('fetch("audio/never-recorded-0000000000.mp3").then(() => false, () => true)'), 'a missing voice must fail cleanly offline'
        for path in ['/curriculum.html?pwa=1', '/curriculum-play.html?pwa=1', '/classic.html?pwa=1', '/index.html?pwa=1']:
            response = page.goto(BASE + path, wait_until='domcontentloaded')
            assert response and response.status == 200, path
        page.goto(BASE + '/curriculum.html?pwa=1', wait_until='load'); page.wait_for_timeout(1500)
        assert page.locator('main').count() == 1
        assert not errors, errors
        browser.close()
finally:
    marker.write_bytes(original)
    if server: stop(server)
print('PWA browser checks passed')
