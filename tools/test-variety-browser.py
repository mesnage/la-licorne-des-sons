"""Actual high-DPI canvas, habitat art, companion animation and travel surprises.
Requires a local server, Playwright and Chromium. Uses real scene/tween time.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8080');parser.add_argument('--screenshots',type=Path);args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
def state(page):return page.evaluate('window.__adventure.state()')
def shot(page,name):
 if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def boot(page,theme=0,suffix=''):
 page.goto(args.url+'/?debug'+suffix,wait_until='domcontentloaded');page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
 page.evaluate('(n)=>localStorage.setItem("licorne.adventure.v1",JSON.stringify({worldsCompleted:n}))',theme)
 page.locator('[data-word-level="1"]').click()
def right(page):
 current=state(page);page.locator('[data-choice-id="'+current['targetId']+'"]').click()
 return current['index']+1
def settled(page,index):page.wait_for_function('(i)=>window.__adventure.state().index===i&&window.__adventure.state().phase==="question"',arg=index)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 errors=[]
 # Real backing pixels, independent of the CSS display size, including rotation and Canvas fallback.
 for renderer in ['', '&renderer=canvas']:
  page=browser.new_page(viewport={'width':1024,'height':768},device_scale_factor=2,has_touch=True,reduced_motion='reduce')
  page.on('pageerror',lambda e:errors.append(str(e)));boot(page,suffix=renderer)
  assert page.locator('canvas').evaluate('(c)=>c.width===2048&&c.height===1536&&c.getBoundingClientRect().width===1024')
  initial=state(page)['world']['animalPoses'];page.wait_for_timeout(200);assert state(page)['world']['animalPoses']==initial
  page.set_viewport_size({'width':390,'height':844})
  page.wait_for_function('document.querySelector("canvas").width===780&&document.querySelector("canvas").height===1688')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  for _ in range(6):settled(page,right(page))
  assert len(state(page)['world']['animalKinds'])==6
  assert not state(page)['world']['propsVisible'] and not state(page)['world']['effectCount']
  page.close()
 print('Retina WebGL/Canvas backing buffers, rotation, reduced motion and quiet companions passed',flush=True)
 # Every habitat has its own animal family, and travel stays still while reading.
 review=browser.new_page(viewport={'width':1024,'height':768},device_scale_factor=2,reduced_motion='reduce')
 review.on('pageerror',lambda e:errors.append(str(e)))
 expected=['meadow','forest','jungle','beach','ice','clouds','moon']
 for theme,habitat in enumerate(expected):
  boot(review,theme)
  for _ in range(6):settled(review,right(review))
  actual=state(review)['world'];assert actual['habitat']==habitat and len(actual['animalKinds'])==6
  if habitat=='moon':assert actual['birdCount']==0 and set(actual['animalKinds'])=={'moon-bunny'}
  shot(review,'world-'+habitat)
 review.close();print('All seven habitats and their companion families rendered at Retina density',flush=True)
 # Each new gag in real motion; pause must freeze all new props/companions and leaving must clean them up.
 for theme,kind in [(0,'butterfly'),(2,'crown'),(3,'splash'),(5,'bubble'),(6,'moonhop')]:
  page=browser.new_page(viewport={'width':1024,'height':768},device_scale_factor=2,has_touch=True)
  page.on('pageerror',lambda e:errors.append(str(e)));boot(page,theme)
  for _ in range(5):settled(page,right(page))
  resting=state(page)['world']['animalPoses'];page.wait_for_timeout(250);assert state(page)['world']['animalPoses']==resting
  right(page);page.wait_for_function('(kind)=>window.__adventure.state().world.gag===kind&&window.__adventure.state().world.moving',arg=kind)
  page.wait_for_timeout(450);active=state(page)['world']
  assert active['animalPoses']!=resting
  if kind in ['butterfly','crown','bubble']:assert active['propsVisible']
  if kind=='splash':assert active['effectCount']>0
  if kind=='butterfly':
   target=next((i,p) for i,p in enumerate(active['animalScreens']) if 40<p['x']<980 and 200<p['y']<500)
   before=state(page);page.mouse.click(target[1]['x'],target[1]['y'])
   assert state(page)['world']['greetings'][target[0]]>active['greetings'][target[0]]
   assert state(page)['index']==before['index'] and state(page)['score']==before['score']
  shot(page,'gag-'+kind)
  page.locator('#adventureHome').click();frozen=state(page)['world'];page.wait_for_timeout(250)
  assert state(page)['world']['position']==frozen['position'] and state(page)['world']['animalPoses']==frozen['animalPoses']
  page.locator('#adventureResume').click();settled(page,6)
  assert not state(page)['world']['propsVisible']
  page.locator('#adventureHome').click();page.locator('#adventureLeave').click()
  assert state(page)['world']['effectCount']==0 and not state(page)['world']['propsVisible']
  page.close();print(kind+': real animation, companion greeting, pause/resume and cleanup passed',flush=True)
 assert not errors,errors
 browser.close();print('All rendering and world-variety checks passed')
