"""Parents' progress tracking and the plush-toy world, through the real menu.

Needs the local server (npm run dev) and Python Playwright.
python3 tools/test-progress-browser.py [--url http://127.0.0.1:8080] [--browser-path /usr/bin/chromium] [--screenshots DIR]
"""
import argparse, json
from datetime import date
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_menu import select_activity

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--browser-path', default='/usr/bin/chromium')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots: args.screenshots.mkdir(parents=True, exist_ok=True)

def state(page): return page.evaluate('window.__adventure.state()')
def stored(page): return page.evaluate('JSON.parse(localStorage.getItem("licorne.suivi.v1") || "null")')
def shot(page, name):
    if args.screenshots: page.screenshot(path=str(args.screenshots / (name + '.png')))
def open_game(page):
    page.goto(args.url + '/?debug', wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready', timeout=60000)
def open_progress(page):
    if not page.locator('#progressButton').is_visible(): page.locator('.adventure-help summary').click()
    page.locator('#progressButton').click()
    page.wait_for_selector('#progressDialog[open] .progress-chart')

today = date.today().isoformat()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, reduced_motion='reduce', accept_downloads=True)
    page = context.new_page(); errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    open_game(page)

    # Before any game the view explains itself and offers nothing to download.
    open_progress(page)
    assert page.locator('.progress-empty').is_visible() and page.locator('#progressDownload').is_disabled()
    assert page.locator('.progress-ring-value').text_content() == '0'
    page.locator('#progressClose').click(); assert not page.locator('#progressDialog').evaluate('d => d.open')

    # One right and one wrong answer in « Les voyelles » are counted for today.
    select_activity(page, '[data-module="voyelles"]')
    page.wait_for_function('window.__adventure.state().phase === "question"', timeout=60000)
    current = state(page)
    page.locator('[data-choice-id="' + current['targetId'] + '"]').click()
    page.wait_for_function('i => window.__adventure.state().index === i && window.__adventure.state().phase === "question"', arg=current['index'] + 1, timeout=60000)
    assert stored(page)['days'][today]['voyelles'] == [1, 0, 0]
    current = state(page)
    page.locator('.adventure-answer:not([data-choice-id="' + current['targetId'] + '"])').first.click()
    page.wait_for_function('day => (JSON.parse(localStorage.getItem("licorne.suivi.v1")).days[day].voyelles || [])[1] === 1', arg=today)
    assert stored(page)['days'][today]['voyelles'] == [1, 1, 0]

    # The plush-toy world is in the picker and loads without changing the question.
    page.wait_for_function('window.__adventure.state().phase === "question" && !document.getElementById("worldName").disabled', timeout=60000)
    before = state(page)
    page.locator('#worldName').click()
    assert page.locator('#worldChoices .world-option').count() == 11
    option = page.locator('#worldChoices .world-option', has_text='Le monde des peluches'); assert option.count() == 1
    option.click()
    page.wait_for_function('window.__adventure.state().world.habitat === "peluches" && window.__adventure.state().world.ready', timeout=60000)
    after = state(page)
    assert (after['index'], after['targetId'], after['mode']) == (before['index'], before['targetId'], before['mode'])
    page.wait_for_function('(() => { const frames = document.querySelectorAll("iframe.painted-scene"); return frames.length === 1 && frames[0].contentDocument?.body?.dataset.habitat === "peluches" && !!frames[0].contentWindow.meadowScene; })()', timeout=60000)
    page.wait_for_timeout(1200); shot(page, 'peluches-phone')
    assert stored(page)['days'][today]['voyelles'] == [1, 1, 0], 'changing world is not an answer'

    # A new visit keeps the numbers and adds to them.
    page.reload(wait_until='domcontentloaded'); page.wait_for_function('window.__adventure?.state().ready', timeout=60000)
    assert stored(page)['days'][today]['voyelles'] == [1, 1, 0]
    page.evaluate('''day => { const data = JSON.parse(localStorage.getItem("licorne.suivi.v1"));
      const d = new Date(); d.setDate(d.getDate() - 9); const old = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      data.days[old] = { "words-1": [6, 2, 1], "find-typo": [3, 1, 0] }; localStorage.setItem("licorne.suivi.v1", JSON.stringify(data)); }''', today)
    # The interrupted game is restored after a reload: leave it to reach the parents' menu.
    if not page.locator('.adventure-help').is_visible():
        page.wait_for_selector('#adventurePause[open]'); page.locator('#adventureLeave').click()
        if page.locator('#chapterBack').is_visible(): page.locator('#chapterBack').click()
    page.wait_for_selector('.adventure-help', state='visible')
    open_progress(page)
    assert page.locator('.progress-empty').count() == 0
    assert page.locator('.progress-bar').count() == 14
    assert '14' in page.locator('.progress-big').inner_text(), page.locator('.progress-big').inner_text()
    assert page.locator('.progress-bar').last.get_attribute('aria-label').endswith('1 réponse juste, 1 erreur')
    shot(page, 'progress-days')
    page.locator('.progress-segment button[data-value="week"]').click()
    assert page.locator('.progress-bar').count() == 12
    page.locator('.progress-segment button[data-value="words"]').click()
    assert page.locator('.progress-big strong').inner_text() == '8'
    page.locator('.progress-segment button[data-value="letters"]').click()
    assert page.locator('.progress-big strong').inner_text() == '2'
    page.locator('.progress-bar').last.click()
    assert 'Semaine du' in page.locator('.progress-eyebrow').text_content()
    row = page.locator('.progress-table tbody tr', has_text='Les voyelles')
    assert [cell.strip() for cell in row.locator('td').all_inner_texts()] == ['1', '1', '50 %', '0']
    fits = page.evaluate('(() => { const d = document.getElementById("progressDialog"); return d.scrollWidth <= d.clientWidth + 1; })()')
    assert fits, 'the view must not scroll sideways on a phone'
    shot(page, 'progress-weeks')

    # The CSV has one line per day and exercise and opens in a French spreadsheet.
    with page.expect_download() as info: page.locator('#progressDownload').click()
    download = info.value
    assert download.suggested_filename == 'suivi-paillette-' + today + '.csv'
    raw = Path(download.path()).read_bytes(); assert raw.startswith(b'\xef\xbb\xbf')
    lines = raw.decode('utf-8-sig').strip().split('\r\n')
    assert lines[0].startswith('date;famille;exercice;identifiant;reponses_justes;reponses_fausses')
    assert len(lines) == 4 and lines[-1] == today + ';Lettres;Les voyelles;voyelles;1;1;50;0', lines
    assert 'enregistré' in page.locator('.progress-status').inner_text()
    assert not errors, errors
    browser.close()
print('Progress tracking and plush-world browser checks passed')
