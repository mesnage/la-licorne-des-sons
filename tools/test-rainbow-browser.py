"""Repeatable visual/gameplay review: actual climbing, birds, pauses and scene cleanup.
Requires a local :8080 server, Python Playwright and Chromium. No clock shortcuts.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
speech="""window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'fr-FR',localService:true}],cancel(){},speak(){},addEventListener(){},removeEventListener(){}}});"""
def state(page):return page.evaluate('window.__adventure.state()')
def shot(page,name):
    if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def open_game(page,suffix=''):
    page.goto(args.url+'/?debug'+suffix,wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
def right(page):
    before=state(page)
    page.locator('[data-choice-id="'+before['targetId']+'"]').click()
    return before['index']+1
def settle(page,index):page.wait_for_function('(i)=>window.__adventure.state().index===i&&window.__adventure.state().phase==="question"',arg=index)
def pause(page):
    page.locator('#adventureHome').click()
    page.wait_for_function('window.__adventure.state().paused')
def leave(page):
    pause(page);page.locator('#adventureLeave').click()
    assert page.locator('#adventureMenu').is_visible()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    errors=[]
    # Real motion: pause in feedback, on the ascent, and while returning across the bridge.
    page=browser.new_page(viewport={'width':390,'height':844},has_touch=True)
    page.add_init_script(speech);page.on('pageerror',lambda e:errors.append(str(e)));open_game(page)
    page.locator('[data-word-level="1"]').click()
    initial=state(page);page.wait_for_timeout(300)
    assert state(page)['world']['birdSeconds']==initial['world']['birdSeconds']
    index=right(page);pause(page);page.wait_for_timeout(900)
    assert state(page)['index']==0 and not state(page)['world']['moving']
    assert page.locator('#adventureResume').evaluate('(b)=>b===document.activeElement')
    shot(page,'pause-phone');page.locator('#adventureResume').click();settle(page,index)
    for _ in range(2):settle(page,right(page))
    assert state(page)['world']['onBridge'] and state(page)['world']['birdCount']==9
    right(page);page.wait_for_function('window.__adventure.state().world.moving&&window.__adventure.state().world.bridgeLift>160')
    pause(page);frozen=state(page)['world'];page.wait_for_timeout(500)
    assert state(page)['world']['position']==frozen['position']
    assert state(page)['world']['birdSeconds']==frozen['birdSeconds']
    page.keyboard.press('Escape');page.wait_for_function('!window.__adventure.state().paused')
    shot(page,'rainbow-climb-phone');settle(page,4)
    assert state(page)['world']['birdSeconds']>initial['world']['birdSeconds']
    # Bird animation rests as soon as answer cards reappear, including flapping frames.
    rest=state(page)['world']['birdSeconds'];page.wait_for_timeout(300)
    assert state(page)['world']['birdSeconds']==rest
    before=state(page)
    page.locator('.adventure-answer:not([data-choice-id="'+before['targetId']+'"])').first.click()
    page.wait_for_function('window.__adventure.state().world.moving&&window.__adventure.state().phase==="returning"')
    pause(page);frozen=state(page)['world'];page.wait_for_timeout(400)
    assert state(page)['world']['position']==frozen['position']
    page.locator('#adventureResume').click();settle(page,0)
    # Leaving during the feedback delay must never resurrect the abandoned journey.
    right(page);leave(page);page.wait_for_timeout(900)
    assert state(page)['phase'] is None and state(page)['world']['crystals']==0
    print('Feedback, climb and return pause/resume; Escape; quiet birds; safe activity change passed')
    # Phone rotation, desktop and tablet framing: crest and road remain real world geometry.
    for w,h in [(1280,900),(844,390),(768,1024)]:
        view=browser.new_page(viewport={'width':w,'height':h},has_touch=True)
        view.add_init_script(speech);view.on('pageerror',lambda e:errors.append(str(e)));open_game(view)
        view.locator('[data-module="voyelles"]').click()
        for _ in range(3):settle(view,right(view))
        right(view);view.wait_for_function('window.__adventure.state().world.moving&&window.__adventure.state().world.bridgeLift>160')
        shot(view,f'rainbow-climb-{w}x{h}')
        if w==768:view.set_viewport_size({'width':h,'height':w})
        settle(view,4)
        assert state(view)['world']['onBridge']
        assert view.locator('.adventure-answer').evaluate_all('bs=>bs.every(b=>b.scrollWidth<=b.clientWidth)')
        view.close()
    print('Live climbs and rotation on desktop, landscape phone and tablet passed')
    # Repeated scene resets must not accumulate decorative objects or animation timers.
    reduced=browser.new_page(viewport={'width':320,'height':568},has_touch=True,reduced_motion='reduce')
    reduced.add_init_script(speech);reduced.on('pageerror',lambda e:errors.append(str(e)));open_game(reduced,'&renderer=canvas')
    count=state(reduced)['world']['childCount']
    for _ in range(12):
        reduced.locator('[data-module="consonnes"]').click();settle(reduced,right(reduced));leave(reduced)
        actual=state(reduced)['world'];assert actual['birdCount']==9 and actual['childCount']==count
        assert actual['effectCount']==0 and actual['birdSeconds']==0
    reduced.locator('.adventure-help summary').click()
    assert reduced.locator('.adventure-help').evaluate('(d)=>d.open')
    reduced.locator('.adventure-help p').last.scroll_into_view_if_needed()
    shot(reduced,'parents-help-phone')
    assert not errors,errors
    browser.close();print('Twelve repeated scene resets, reduced motion, Canvas and parent help passed')
