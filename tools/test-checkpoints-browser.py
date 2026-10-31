"""Main adventure rules and gags; requires a running local server, Playwright and Chromium."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
speech="""window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'fr-FR',localService:true}],cancel(){},speak(){},addEventListener(){},removeEventListener(){}}});"""
def shot(page,name):
    if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def state(page):return page.evaluate('window.__adventure.state()')
def open_game(page):
    page.goto(args.url+'/?debug',wait_until='domcontentloaded')
    page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
def choose(page,mode='words',level=1):
    page.locator(f'[data-module="{mode}"]').click()
    if mode=='words':page.locator(f'[data-word-level="{level}"]').click()
def correct(page):
    current=state(page)
    page.locator('[data-choice-id="'+current['targetId']+'"]').click()
    page.wait_for_function('(i)=>window.__adventure.state().index===i',arg=current['index']+1)
def reach(page,count):
    while state(page)['index']<count:correct(page)
def fail_to(page,checkpoint):
    current=state(page)
    page.locator('.adventure-answer:not([data-choice-id="'+current['targetId']+'"])').first.click()
    page.wait_for_function('(i)=>window.__adventure.state().phase==="question"&&window.__adventure.state().index===i',arg=checkpoint)
    actual=state(page)
    assert actual['world']['crystals']==checkpoint
    assert actual['world']['visibleCrystals']==10-checkpoint%10
    assert actual['world']['worldCrystals']==checkpoint%10
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    errors=[]
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
    context.add_init_script(speech)
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));open_game(page)
    assert page.locator('[data-module]').count()==7
    assert page.locator('.adventure-menu-footer a').count()==0
    choose(page);reach(page,4);fail_to(page,0)
    reach(page,5)
    assert 'sauvegardé' in page.locator('#adventureRefuge').inner_text()
    assert page.evaluate('Object.values(JSON.parse(localStorage.getItem("licorne.words.v1"))).reduce((n,s)=>n+s.completed,0)')==5
    reach(page,8);fail_to(page,5)
    assert state(page)['world']['position']['x']==1720
    shot(page,'saved-refuge')
    reach(page,10)
    assert state(page)['score']==8
    assert page.evaluate('Object.values(JSON.parse(localStorage.getItem("licorne.words.v1"))).reduce((n,s)=>n+s.completed,0)')==10
    page.wait_for_function('document.querySelector("#rewardsDialog").open')
    assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
    page.locator('#rewardsClose').click();page.locator('#adventureChoose').click()
    choose(page,'voyelles');initial=state(page)['world']['theme']
    assert initial==1
    reach(page,9);assert state(page)['world']['theme']==initial
    correct(page)
    assert state(page)['world']['worldIndex']==1 and state(page)['world']['worldCrystals']==0
    assert state(page)['world']['theme']==2
    assert '0 / 10' in page.locator('#adventureCount').inner_text()
    shot(page,'next-world')
    reach(page,14);fail_to(page,10)
    assert state(page)['world']['theme']==2
    reach(page,15);reach(page,19);fail_to(page,15)
    assert 'sauvegardé' in page.locator('#adventureRefuge').inner_text()
    reach(page,20);page.wait_for_function('document.querySelector("#rewardsDialog").open')
    assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==2
    assert page.evaluate('JSON.parse(localStorage.getItem("licorne.adventure.v1")).worldsCompleted')==3
    page.locator('#rewardsClose').click();shot(page,'castle-main')
    open_game(page);assert state(page)['world']['theme']==3
    print('Worlds at ten crystals; rollbacks 4→0, 8→5, 14→10, 19→15; no inflated credit/rewards; persistent world variety passed')
    # Real-time animations of all four gags, followed by an interrupted return to the refuge.
    motion=browser.new_page(viewport={'width':1280,'height':900})
    motion.add_init_script(speech);motion.on('pageerror',lambda e:errors.append(str(e)))
    open_game(motion);choose(motion)
    for index in range(10):
        current=state(motion)
        motion.locator('[data-choice-id="'+current['targetId']+'"]').click()
        kind={2:'prout',4:'rainbow',7:'boing',9:'hat'}.get(index+1)
        if kind:
            motion.wait_for_function('(g)=>window.__adventure.state().world.gag===g',arg=kind)
            motion.wait_for_timeout(250)
            if kind=='prout':assert state(motion)['world']['effectCount']>0
            if kind=='rainbow':assert state(motion)['world']['angle']!=0
            if kind=='hat':assert state(motion)['world']['hatVisible']
            shot(motion,'gag-'+kind)
        motion.wait_for_function('(i)=>window.__adventure.state().index===i',arg=index+1)
    motion.wait_for_function('document.querySelector("#rewardsDialog").open')
    motion.locator('#rewardsClose').click();motion.locator('#adventureChoose').click();choose(motion)
    reach(motion,3)
    current=state(motion)
    motion.locator('.adventure-answer:not([data-choice-id="'+current['targetId']+'"])').first.click()
    motion.wait_for_function('window.__adventure.state().world.moving&&window.__adventure.state().phase==="returning"')
    assert 'début' in motion.locator('#adventureWalking').inner_text()
    motion.locator('#adventureHome').click();motion.locator('#adventureLeave').click();motion.wait_for_timeout(1600)
    assert state(motion)['phase'] is None and state(motion)['world']['crystals']==0
    print('Real prout, rainbow climb, trampoline and magic-hat animations; leaving during rollback passed')
    # Larger text and safe touch targets, including four-letter phonics groups and long words.
    for width,height in [(320,568),(390,844),(844,390),(768,1024),(1024,768)]:
        view=context.new_page();view.set_viewport_size({'width':width,'height':height});open_game(view)
        view.on('pageerror',lambda e:errors.append(str(e)));choose(view,'words',3)
        assert view.locator('.adventure-answer').evaluate_all('(bs)=>bs.every(b=>b.scrollWidth<=b.clientWidth&&b.getBoundingClientRect().height>=44&&parseFloat(getComputedStyle(b).fontSize)>=24)')
        assert view.evaluate('document.documentElement.scrollWidth<=innerWidth')
        shot(view,f'large-words-{width}x{height}')
        view.locator('#adventureHome').click();view.locator('#adventureLeave').click();choose(view,'experts')
        # Exercise a real four-letter question rather than rewriting rendered card styles.
        for _ in range(20):
            if view.locator('.adventure-answer').evaluate_all('bs=>bs.some(b=>b.dataset.choiceId.length===4)'):break
            correct(view)
        assert view.locator('.adventure-answer').evaluate_all('bs=>bs.some(b=>b.dataset.choiceId.length===4)')
        assert view.locator('.adventure-answer').evaluate_all('(bs)=>bs.every(b=>b.scrollWidth<=b.clientWidth&&parseFloat(getComputedStyle(b).fontSize)>=25)'), view.locator('.adventure-answer').evaluate_all('(bs)=>bs.map(b=>({w:b.clientWidth,scroll:b.scrollWidth,font:getComputedStyle(b).fontSize}))')
        view.close()
    assert not errors,errors
    browser.close();print('All checkpoint, gag and enlarged-answer checks passed')
