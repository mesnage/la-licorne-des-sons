"""World changes preserve the current adventure; ambient motion continues while reading."""
from browser_menu import select_activity
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--browser-path', default='/usr/bin/chromium')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)

def state(page):
    return page.evaluate('window.__adventure.state()')

def boot(page):
    page.goto(args.url + '/?debug', wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready')

def pick(page, theme):
    page.locator('#worldName').click(no_wait_after=True)
    assert page.locator('#worldDialog').is_visible()
    assert page.locator('#worldChoices button').count() == 7
    page.locator(f'[data-world-id="{theme}"]').click(no_wait_after=True)
    assert not page.locator('#worldDialog').is_visible()
    assert state(page)['world']['theme'] == theme
    assert not state(page)['paused']

def right(page):
    current = state(page)
    page.locator(f'[data-choice-id="{current["targetId"]}"]').click()
    page.wait_for_function('(index)=>window.__adventure.state().index===index&&window.__adventure.state().phase==="question"', arg=current['index'] + 1)

def ambient(page):
    world = state(page)['world']
    return (world['animalPoses'], world['foliageAngles'], world['birdSeconds'])

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, headless=True)
    errors = []
    page = browser.new_page(viewport={'width':390,'height':844}, has_touch=True, reduced_motion='reduce')
    page.on('pageerror', lambda e: errors.append(str(e)))
    boot(page)
    for theme in range(7):
        pick(page, theme)
    page.reload();page.wait_for_function('window.__adventure?.state().ready')
    assert state(page)['world']['theme'] == 6
    pick(page, 0)
    select_activity(page,'[data-module="voyelles"]')
    for _ in range(10):
        right(page)
    before = state(page)
    assert before['world']['worldIndex'] == 1
    saved = page.evaluate('({mastery:localStorage.getItem("licorne.mastery.v1"),rewards:localStorage.getItem("licorne.rewards.v1"),history:localStorage.getItem("licorne.adventure.v1")})')
    pick(page, 6)
    after = state(page)
    for key in ['index','targetId','phase','total','mastery']:
        assert before[key] == after[key], key
    for key in ['crystals','progress','worldIndex','worldCrystals','visibleCrystals']:
        assert before['world'][key] == after['world'][key], key
    assert saved == page.evaluate('({mastery:localStorage.getItem("licorne.mastery.v1"),rewards:localStorage.getItem("licorne.rewards.v1"),history:localStorage.getItem("licorne.adventure.v1")})')
    right(page)
    assert state(page)['world']['theme'] == 6
    still = ambient(page);page.wait_for_timeout(300);assert ambient(page) == still
    page.locator('#worldName').click(no_wait_after=True)
    page.keyboard.press('Escape')
    assert not state(page)['paused'] and state(page)['targetId'] is not None
    print('Seven-world selection, persisted preference, in-progress question/crystals and reduced motion passed', flush=True)
    page.close()

    live = browser.new_page(viewport={'width':1024,'height':768}, device_scale_factor=2)
    live.on('pageerror', lambda e: errors.append(str(e)));boot(live)
    select_activity(live,'[data-word-level="1"]')
    before = state(live);poses = ambient(live);live.wait_for_timeout(400)
    after = state(live)
    assert before['index'] == after['index'] and before['targetId'] == after['targetId']
    assert all(a != b for a,b in zip(poses, ambient(live)))
    live.locator('#worldName').click();live.wait_for_timeout(80)
    poses = ambient(live);live.wait_for_timeout(300);assert ambient(live) == poses
    if args.screenshots:
        live.screenshot(path=str(args.screenshots/'world-picker-desktop.png'))
    live.locator('#worldDialogClose').click()
    live.wait_for_timeout(300);assert ambient(live) != poses
    live.locator('#adventureHome').click();live.wait_for_timeout(80)
    poses = ambient(live);live.wait_for_timeout(300);assert ambient(live) == poses
    live.locator('#adventureResume').click()
    live.wait_for_timeout(250);assert ambient(live) != poses
    right(live)
    assert state(live)['index'] == 1
    print('Ambient animals/birds/foliage move while reading; picker and pause freeze/resume the scene', flush=True)
    live.locator('#worldName').click()
    live.set_viewport_size({'width':320,'height':568})
    assert live.locator('.world-option').evaluate_all('bs=>bs.every(b=>b.scrollWidth<=b.clientWidth&&b.clientHeight>=44)')
    assert live.evaluate('document.documentElement.scrollWidth<=innerWidth')
    if args.screenshots:
        live.screenshot(path=str(args.screenshots/'world-picker-phone.png'))
    live.locator('[data-world-id="3"]').click()
    assert state(live)['world']['habitat'] == 'beach'
    assert not errors, errors
    browser.close()
    print('Phone picker layout and selection passed; no JavaScript errors', flush=True)
