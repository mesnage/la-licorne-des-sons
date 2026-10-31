"""Phaser 4 integration checks; requires Playwright, Chromium and a server on :8080.
Word speech is simulated. The actual Phaser engine, textures, camera and movement are exercised.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots: args.screenshots.mkdir(parents=True,exist_ok=True)
speech="""
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
window.__speech=[];
Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'fr-FR',localService:true}],cancel(){},speak(u){window.__speech.push(u.text);},addEventListener(){},removeEventListener(){}}});
"""
def shot(page,name):
    if args.screenshots: page.screenshot(path=str(args.screenshots/(name+'.png')))
def open_proto(page,suffix=''):
    page.goto(args.url+'/index.html?debug'+suffix,wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
def choose(page,module,level=1):
    page.locator(f'[data-module="{module}"]').click()
    if module=='words': page.locator(f'[data-word-level="{level}"]').click()

def right(page):
    state=page.evaluate('window.__adventure.state()')
    page.locator('[data-choice-id="'+state['targetId']+'"]').click()
    return state
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    errors=[]
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
    context.add_init_script(speech)
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    open_proto(page)
    assert page.locator('#adventureWorld canvas').count()==1
    assert page.locator('[data-module]').count()==6
    assert page.evaluate('window.__adventure.state().world.version')=='4.2.1'
    shot(page,'prototype-menu-phone')
    modes=[('voyelles',1),('consonnes',1),('sons',1),('experts',1),('tout',1),('words',1),('words',2),('words',3)]
    for number,(module,level) in enumerate(modes,1):
        choose(page,module,level)
        total=10 if module=='words' else 20
        assert page.locator('.adventure-answer').count()==(4 if module=='words' else 3)
        shot(page,'prototype-'+module+'-'+str(level))
        for index in range(total):
            state=page.evaluate('window.__adventure.state()')
            assert state['index']==index and state['phase']=='question'
            assert page.locator('.adventure-answer').evaluate_all('(buttons)=>buttons.every(b=>b.clientWidth>=b.scrollWidth)')
            if index==0:
                page.locator('.adventure-answer:not([data-choice-id="'+state['targetId']+'"])').first.click()
                page.wait_for_function('window.__adventure.state().phase==="question"')
                assert page.evaluate('window.__adventure.state().index')==0
                assert page.evaluate('window.__adventure.state().world.progress')==0
                page.locator('#listenBtn').click()
            right(page)
            page.wait_for_function('(index)=>window.__adventure.state().index===index',arg=index+1)
            assert page.evaluate('window.__adventure.state().world.progress')==(index+1)/total
        assert page.locator('#adventureFinish').is_visible()
        assert 'château de cristal' in page.locator('#worldName').inner_text()
        page.wait_for_function('document.querySelector("#rewardsDialog").open')
        assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
        page.locator('#rewardsClose').click()
        shot(page,'prototype-castle')
        page.locator('#winReward').click()
        page.locator('#spinReward').click(click_count=2)
        page.wait_for_function('document.querySelector("#rewardsClose").disabled===false')
        assert page.locator('#dailyTotal').inner_text()==str(number)
        assert page.locator('#spinReward').is_disabled()
        page.locator('#rewardsClose').click()
        assert page.locator('#savingsOpen').count()==0
        page.locator('#adventureChoose').click()
        print(f'{module} level {level}: {total} questions, retry, castle arrival and one spin passed')
    assert page.evaluate('localStorage.getItem("licorne.words.v1")')
    # Normal-motion test proves real sprite frames, movement and cancellation, without a clock shortcut.
    motion=browser.new_page(viewport={'width':1280,'height':900})
    motion.on('pageerror',lambda e:errors.append(str(e)));open_proto(motion)
    shot(motion,'prototype-menu-desktop');choose(motion,'voyelles');shot(motion,'prototype-meadow')
    right(motion)
    motion.wait_for_function('window.__adventure.state().world.moving')
    first=motion.evaluate('window.__adventure.state().world.position.x')
    motion.wait_for_function('(x)=>window.__adventure.state().world.position.x>x+20',arg=first)
    assert motion.evaluate('window.__adventure.state().world.frame') is not None
    shot(motion,'prototype-walking')
    motion.locator('#adventureHome').click()
    motion.wait_for_timeout(2200)
    assert motion.locator('#adventureMenu').is_visible()
    assert motion.evaluate('window.__adventure.state().world.progress')==0
    assert motion.evaluate('window.__adventure.state().phase') is None
    print('Real walking animation, moving path and cancellation on leaving passed')
    # Canvas fallback and responsive layouts, independent of external fonts/CDNs.
    for width,height in [(320,568),(844,390),(768,1024),(1024,768)]:
        view=browser.new_page(viewport={'width':width,'height':height},has_touch=True,reduced_motion='reduce')
        view.add_init_script(speech);view.on('pageerror',lambda e:errors.append(str(e)))
        open_proto(view,'&renderer=canvas')
        assert view.evaluate('window.__adventure.state().world.renderer')==1
        choose(view,'words',3)
        assert view.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert view.locator('.adventure-answer').evaluate_all('(buttons)=>buttons.every(b=>b.getBoundingClientRect().height>=44&&b.scrollWidth<=b.clientWidth)')
        shot(view,f'prototype-{width}x{height}')
        view.set_viewport_size({'width':height,'height':width})
        assert view.evaluate('document.documentElement.scrollWidth<=innerWidth')
        view.close()
    print('Canvas fallback, phone/tablet portrait/landscape and resizing passed')
    # Unavailable engine leaves a useful path back to the full classic game.
    failure=browser.new_page()
    failure.route('**/vendor/phaser/**',lambda route:route.abort())
    failure.goto(args.url+'/index.html',wait_until='domcontentloaded')
    failure.wait_for_function('document.querySelector("#engineStatus").textContent.includes("n’a pas pu démarrer")')
    failure.locator('#legacyFallback').click()
    failure.wait_for_function('window.__licorneOK')
    assert failure.locator('[data-level]').count()==5
    assert failure.locator('#wordActivityOpen').is_visible()
    print('Engine failure fallback and classic modules remain accessible')
    assert not errors,errors
    browser.close()
    print('All prototype checks passed. Actual Safari/iPad voice quality still needs device review.')
