"""Four 2x2 chapters, thirteen activities, and the new six-slot family reward wheel."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_menu import select_activity
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--browser-path',default='/usr/bin/chromium')
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
chapters={
 'letters':['voyelles','consonnes'],
 'sounds':['blend-simple','blend-silent','sons'],
 'words':['words-1','words-2','words-3'],
 'sentences':['sentence-copy-3','sentence-copy-5','sentence-listen-3','sentence-listen-5','find-typo']
}
legacy="""if(!localStorage.getItem('licorne.rewards.v1'))localStorage.setItem('licorne.rewards.v1',JSON.stringify({pending:6,day:[new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,'0'),String(new Date().getDate()).padStart(2,'0')].join('-'),counts:[2,3,4,5]}));"""
def state(page):return page.evaluate('window.__adventure.state()')
def boot(page,classic=False):
 page.goto(args.url+('/classic.html?debug' if classic else '/?debug'),wait_until='domcontentloaded')
 page.wait_for_function('window.__licorneOK' if classic else 'window.__adventure?.state().ready')
def shot(page,name):
 if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def leave(page):
 page.locator('#adventureHome').click(no_wait_after=True);page.locator('#adventureLeave').click(no_wait_after=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=args.browser_path,headless=True)
 context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
 context.add_init_script(legacy)
 errors=[];page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));boot(page)
 assert page.locator('[data-chapter]').all_text_contents()==['Les lettres','Les sons','Les mots','Les phrases']
 assert page.locator('#adventureModules button:visible').count()==0
 for width,height in [(320,568),(390,844),(459,724),(844,390),(768,1024),(1280,900)]:
  page.set_viewport_size({'width':width,'height':height})
  rects=page.locator('[data-chapter]').evaluate_all('buttons=>buttons.map(button=>{const r=button.getBoundingClientRect(),menu=button.closest("#adventureMenu").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,fits:r.top>=menu.top&&r.bottom<=Math.min(menu.bottom,innerHeight)&&r.left>=0&&r.right<=innerWidth&&button.scrollWidth<=button.clientWidth};})')
  shot(page,f'chapters-{width}-{height}')
  assert len(rects)==4 and all(rect['fits'] and rect['height']>=44 for rect in rects),(width,height,rects)
  assert abs(rects[0]['y']-rects[1]['y'])<1 and abs(rects[2]['y']-rects[3]['y'])<1
  assert rects[2]['y']>rects[0]['y'] and abs(rects[0]['x']-rects[2]['x'])<1
 page.set_viewport_size({'width':390,'height':844})
 # Navigate every chapter and start each real activity. Leaving returns to its chapter.
 for chapter,activities in chapters.items():
  page.locator(f'[data-chapter="{chapter}"]').click(no_wait_after=True)
  assert page.locator('#adventureModules button:visible').evaluate_all('buttons=>buttons.map(button=>button.dataset.activityId)')==activities
  shot(page,'chapter-'+chapter)
  for activity in activities:
   select_activity(page,f'[data-activity-id="{activity}"]')
   current=state(page);assert current['phase']=='question' and current['total']==(40 if activity.startswith('blend-') else 20 if activity in ['voyelles','consonnes','sons'] else 10)
   leave(page)
   assert page.locator('#chapterActivities').is_visible() and not page.locator('#chapterHome').is_visible()
   assert page.locator('#adventureModules button:visible').evaluate_all('buttons=>buttons.map(button=>button.dataset.activityId)')==activities
  page.locator('#chapterBack').click(no_wait_after=True)
  assert page.locator('[data-chapter]:visible').count()==4
 assert page.locator('canvas').count()==1
 assert page.evaluate('localStorage.getItem("licorne.words.v1")===null&&localStorage.getItem("licorne.sentences.v1")===null&&localStorage.getItem("licorne.typos.v1")===null')
 print('Four 2x2 chapters fit all six screen sizes; all 13 activities start and return to the correct chapter',flush=True)
 # All six deterministic spins use an isolated legacy save, preserving old gifts without relabeling them.
 page.locator('#rewardPending').click(no_wait_after=True)
 assert page.locator('#fartScene,#fartUnicorn').count()==0
 assert page.locator('#rewardWheel>[data-prize]').evaluate_all('slots=>slots.map(slot=>slot.dataset.prize)')==['chocolate','candies','tv','chocolate','candies','coin']
 assert page.locator('#dailyTotal').inner_text()=='14'
 assert 'prout' not in page.locator('#rewardsDialog').inner_text().lower()
 shot(page,'new-wheel')
 for segment in range(6):
  page.evaluate('(roll)=>{Math.random=()=>roll;}',(segment+.5)/6)
  page.locator('#spinReward').click(click_count=2,no_wait_after=True)
  assert page.locator('#rewardsClose').is_disabled()
  page.wait_for_function('!document.querySelector("#rewardsClose").disabled')
  saved=page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1"))')
  assert saved['pending']==5-segment and saved['version']==2 and saved['earlier']==[4,5]
 assert saved['counts']==[4,5,1,1] and page.locator('#dailyTotal').inner_text()=='20'
 assert 'pièce' in page.locator('#rewardResult').inner_text()
 shot(page,'coin-result')
 page.locator('#rewardsClose').click(no_wait_after=True)
 # Complete one real ten-word adventure to verify earning still adds exactly one spin.
 select_activity(page,'[data-word-level="1"]')
 for index in range(10):
  current=state(page);page.locator('[data-choice-id="'+current['targetId']+'"]').click(no_wait_after=True)
  page.wait_for_function('(index)=>window.__adventure.state().index===index',arg=index+1)
 page.wait_for_function('document.querySelector("#rewardsDialog").open')
 assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
 page.locator('#rewardsClose').click(no_wait_after=True);page.locator('#adventureChoose').click(no_wait_after=True)
 page.locator('#chapterBack').click(no_wait_after=True)
 print('Six slots award 2 chocolates, 2 candies, 10 minutes of TV and one coin; old wins and earned spins survive',flush=True)
 # The classic fallback shares the same new prizes and contains no unicorn reward UI.
 classic=context.new_page();classic.on('pageerror',lambda error:errors.append(str(error)));boot(classic,True)
 classic.locator('#rewardPending').click(no_wait_after=True)
 assert classic.locator('#rewardWheel>[data-prize="chocolate"]').count()==2
 assert classic.locator('#rewardWheel>[data-prize="candies"]').count()==2
 assert classic.locator('#fartScene,#fartUnicorn').count()==0
 assert 'prout' not in classic.locator('#rewardsDialog').inner_text().lower()
 assert classic.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
 classic.evaluate('Math.random=()=>5.5/6');classic.locator('#spinReward').click(no_wait_after=True)
 classic.wait_for_function('document.querySelector("#rewardResult").textContent.includes("pièce")')
 assert classic.locator('#dailyTotal').inner_text()=='21'
 assert classic.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).counts')==[4,5,1,2]
 # Normal-motion wheel: input stays locked until the real reveal timer finishes.
 normal=browser.new_context(viewport={'width':1280,'height':900})
 normal.add_init_script("localStorage.setItem('licorne.rewards.v1',JSON.stringify({version:2,pending:1,day:'',counts:[0,0,0,0],earlier:[0,0]}));")
 desktop=normal.new_page();desktop.on('pageerror',lambda error:errors.append(str(error)));boot(desktop)
 desktop.locator('#rewardPending').click(no_wait_after=True);desktop.evaluate('Math.random=()=>2.5/6')
 desktop.locator('#spinReward').click(no_wait_after=True)
 assert desktop.locator('#spinReward').is_disabled() and desktop.locator('#rewardsClose').is_disabled()
 desktop.wait_for_function('document.querySelector("#rewardResult").textContent.includes("10 minutes de télé")')
 assert desktop.locator('#spinReward').is_disabled() and not desktop.locator('#rewardsClose').is_disabled()
 assert desktop.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==0
 shot(desktop,'tv-result-desktop')
 assert not errors,errors
 browser.close();print('Classic fallback, new prize illustrations and normal-motion wheel locking passed',flush=True)
