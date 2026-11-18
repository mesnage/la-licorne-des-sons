"""Crossroads question view: doors stay aligned, readable and clear of the HUD through rotations,
world changes, pause and answers given mid-transition."""
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

PORTRAIT, LANDSCAPE, TABLET = (390, 844), (844, 390), (1024, 768)
MEASURE = '''() => {
  const rect = n => { const r = n.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
  const frame = document.querySelector('iframe.painted-scene');
  const doors = [...document.querySelectorAll('[data-road-door]')];
  return {
    doors: doors.map(rect), fonts: doors.map(d => parseFloat(getComputedStyle(d).fontSize)),
    layout: frame.contentWindow.meadowScene.roadLayout().map(p => [p.x, p.y, p.x + p.width, p.y + p.height]),
    panel: rect(document.querySelector('#adventureQuestion')), hud: rect(document.querySelector('#adventureHud')),
    header: rect(document.querySelector('.adventure-header')), size: [innerWidth, innerHeight],
    frames: document.querySelectorAll('iframe.painted-scene').length,
    moving: doors.some(d => d.getAnimations().some(a => a.playState !== 'finished')),
  };
}'''

def state(page):
    return page.evaluate('window.__adventure.state()')

def shot(page, name):
    if args.screenshots:
        page.screenshot(path=str(args.screenshots / f'{name}.png'))

def settle(page, doors=3):
    """Wait until the question is up and the door signs have stopped moving."""
    page.wait_for_function(
        '(n)=>{const s=window.__adventure.state();return s.phase==="question"&&!s.paused&&s.world.fork?.visible&&s.world.fork.doors===n'
        '&&document.querySelectorAll("[data-road-door]").length===n;}', arg=doors, timeout=20000)
    last, calm = None, 0
    for _ in range(60):
        page.wait_for_timeout(120)
        now = page.evaluate(MEASURE)
        same = last and not now['moving'] and all(now[k] == last[k] for k in ('doors', 'layout', 'panel', 'hud'))
        calm = calm + 1 if same else 0
        if calm >= 4:
            return now
        last = now
    raise AssertionError('door signs never settled')

def check(page, label, doors=3):
    m = settle(page, doors)
    w, h = m['size']
    fork = state(page)['world']['fork']
    assert m['frames'] == 1, f'{label}: {m["frames"]} scenes mounted'
    for i, (door, slot) in enumerate(zip(m['doors'], m['layout'])):
        assert all(abs(a - b) <= 2 for a, b in zip(door, slot)), f'{label}: sign {i} is off its door {door} vs {slot}'
        assert door[0] >= -1 and door[2] <= w + 1 and door[1] >= 0 and door[3] <= h, f'{label}: sign {i} leaves the screen {door}'
        assert door[1] >= (m['hud'][3] if fork['tall'] else m['header'][3]) - 2, f'{label}: sign {i} hides under the header or counter {door}'
        assert door[3] <= m['panel'][1] + 1 or door[2] <= m['panel'][0] + 1, f'{label}: sign {i} hides under the prompt {door}'
        assert door[2] - door[0] >= 60 and door[3] - door[1] >= 36, f'{label}: sign {i} is too small to tap {door}'
        if i:
            assert door[0] >= m['doors'][i - 1][2] - 1, f'{label}: signs {i - 1} and {i} overlap'
    assert min(m['fonts']) >= 20, f'{label}: letters too small {m["fonts"]}'
    hero = fork['hero']
    assert hero and 0 < hero['x'] < w, f'{label}: Paillette is off screen {hero}'
    limit = m['panel'][1] if fork['tall'] else h
    assert hero['y'] <= limit + 1, f'{label}: Paillette stands under the prompt ({hero["y"]} > {limit})'
    assert hero['scale'] >= .3, f'{label}: Paillette is tiny {hero}'
    shot(page, label)
    return m

def rotate(page, size):
    page.set_viewport_size({'width': size[0], 'height': size[1]})

def pick_world(page, theme):
    page.locator('#worldName').click(no_wait_after=True)
    page.locator(f'[data-world-id="{theme}"]').click(no_wait_after=True)
    page.wait_for_function('(t)=>window.__adventure.state().world.theme===t&&window.__adventure.state().world.pendingTheme===null', arg=theme, timeout=20000)

def right(page):
    page.locator(f'[data-choice-id="{state(page)["targetId"]}"]').click(force=True, no_wait_after=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': PORTRAIT[0], 'height': PORTRAIT[1]}, has_touch=True)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    page.goto(args.url + '/?debug&world=0', wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready')
    select_activity(page, '[data-activity-id="voyelles"]')

    check(page, '01-portrait')
    first = state(page)
    rotate(page, LANDSCAPE); check(page, '02-landscape')
    rotate(page, TABLET); check(page, '03-tablet')
    rotate(page, PORTRAIT); check(page, '04-portrait-again')
    after = state(page)
    assert (after['targetId'], after['index'], after['score']) == (first['targetId'], first['index'], first['score']), 'rotation changed the question'

    # every world, in both orientations, without losing the question
    for theme in range(1, 10):
        pick_world(page, theme)
        check(page, f'05-world-{theme}-portrait')
        if theme % 3 == 0:
            rotate(page, LANDSCAPE); check(page, f'05-world-{theme}-landscape'); rotate(page, PORTRAIT)
    assert state(page)['targetId'] == first['targetId'] and state(page)['world']['crystals'] == 0, 'world change lost the question'

    # rotate while the door is opening: the answer still counts once and the next question is laid out
    right(page); page.wait_for_timeout(350); rotate(page, LANDSCAPE)
    page.wait_for_function('window.__adventure.state().index===1', timeout=20000)
    check(page, '06-answered-during-rotation')
    assert state(page)['world']['crystals'] == 1

    # rotate and change world while Paillette walks: the new world arrives with the next question
    right(page); page.wait_for_function('window.__adventure.state().world.moving', timeout=20000)
    rotate(page, PORTRAIT)
    page.locator('#worldName').click(no_wait_after=True)
    page.locator('[data-world-id="2"]').click(no_wait_after=True)
    page.wait_for_function('window.__adventure.state().index===2&&window.__adventure.state().world.theme===2', timeout=30000)
    check(page, '07-walked-into-new-world')
    assert state(page)['world']['crystals'] == 2

    # change world right after answering: no stale door, no double credit
    right(page); page.wait_for_timeout(200)
    page.locator('#worldName').click(no_wait_after=True)
    page.locator('[data-world-id="5"]').click(no_wait_after=True)
    page.wait_for_function('window.__adventure.state().index===3&&window.__adventure.state().world.theme===5', timeout=30000)
    check(page, '08-world-change-after-answer')
    assert state(page)['world']['crystals'] == 3

    # pause, rotate twice, resume
    page.locator('#adventureHome').click(no_wait_after=True)
    rotate(page, LANDSCAPE); page.wait_for_timeout(300); rotate(page, PORTRAIT); page.wait_for_timeout(300)
    page.locator('#adventureResume').click(no_wait_after=True)
    check(page, '09-after-pause')

    # a wrong answer walks back and asks again with fresh doors
    current = state(page)
    page.locator(f'#adventureChoices button:not([data-choice-id="{current["targetId"]}"])').first.click(force=True, no_wait_after=True)
    page.wait_for_function('window.__adventure.state().world.crystals===0&&!window.__adventure.state().world.moving', timeout=30000)
    check(page, '10-after-mistake')

    # four doors for words on a wide screen, panel cards when they cannot fit on a phone
    page.locator('#adventureHome').click(no_wait_after=True)
    page.locator('#adventureLeave').click(no_wait_after=True)
    rotate(page, TABLET)
    select_activity(page, '[data-activity-id="words-1"]')
    check(page, '11-words-tablet', doors=4)
    rotate(page, PORTRAIT)
    page.wait_for_function('document.querySelectorAll("#adventureChoices button").length===4&&!document.querySelector("[data-road-door]")&&!window.__adventure.state().world.fork.visible')
    page.wait_for_timeout(400)
    cards = page.evaluate('[...document.querySelectorAll("#adventureChoices button")].map(b=>{const r=b.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom,r.width,r.height];})')
    assert all(c[4] >= 100 and c[5] >= 44 and c[0] >= 0 and c[2] <= 391 and c[3] <= 845 for c in cards), f'word cards unusable in the panel {cards}'
    shot(page, '12-words-portrait-cards')
    rotate(page, TABLET); check(page, '13-words-tablet-again', doors=4)

    assert not errors, errors[:5]
    browser.close()
print('crossroads: rotations, world changes, pause and answers in transit all pass')
