"""Living scenery, opaque wildlife turns, gameplay continuity and renderer/lifecycle checks."""
from browser_menu import select_activity
import argparse
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--browser-path',default='/usr/bin/chromium')
args=parser.parse_args()
def state(page):return page.evaluate('window.__adventure.state()')
def boot(page,suffix=''):
 page.goto(args.url+'/?debug'+suffix,wait_until='domcontentloaded')
 page.wait_for_function('window.__adventure?.state().ready')
def right(page):
 before=state(page)
 page.locator('[data-choice-id="'+before['targetId']+'"]').click()
 page.wait_for_function('(i)=>window.__adventure.state().index===i&&["question","finished"].includes(window.__adventure.state().phase)',arg=before['index']+1)
def snapshot(page):
 world=state(page)['world']
 return {key:world[key] for key in ['animalPoses','rigPoses','foliageAngles','leafPoses','lighting','birdSeconds']}
def pick(page,theme):
 page.locator('#worldName').click();page.locator(f'[data-world-id="{theme}"]').click()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=args.browser_path,headless=True)
 errors=[]
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
 page.on('pageerror',lambda e:errors.append(str(e)));boot(page)
 select_activity(page,'[data-module="voyelles"]')
 assert set(['bunny','turtle','hedgehog','deer','cow']).issubset(state(page)['world']['animalKinds'])
 before=state(page);motion=snapshot(page);page.wait_for_timeout(350)
 assert motion!=snapshot(page) and state(page)['index']==before['index']
 for rig in state(page)['world']['rigPoses']:
  if rig:
   assert rig['bodyVisible']!=rig['turnVisible']
   assert rig['bodyAlpha']==1 and rig['turnAlpha']==1
   assert all(foot['angle']==0 for foot in rig['feet'])
 page.locator('#adventureHome').click();page.wait_for_timeout(80)
 frozen=snapshot(page);page.wait_for_timeout(250);assert frozen==snapshot(page)
 page.locator('#adventureResume').click();page.wait_for_timeout(200);assert frozen!=snapshot(page)
 for _ in range(3):right(page)
 assert state(page)['world']['onBridge']
 right(page)
 page.locator('#worldName').click();page.wait_for_timeout(80)
 frozen=snapshot(page);page.wait_for_timeout(250);assert frozen==snapshot(page)
 page.locator('[data-world-id="1"]').click()
 assert state(page)['index']==4 and state(page)['world']['habitat']=='forest'
 page.locator('#adventureHome').click();page.locator('#adventureLeave').click();pick(page,0)
 count=state(page)['world']['childCount']
 for _ in range(4):
  select_activity(page,'[data-word-level="1"]')
  page.locator('#adventureHome').click();page.locator('#adventureLeave').click()
  assert state(page)['world']['childCount']==count
  assert state(page)['world']['effectCount']==0
 print('Live scenery, opaque articulated animals, flat feet, pause/picker, rainbow and repeated scene reuse passed',flush=True)
 page.close()
 # All habitats, resizing and actual reduced-motion behavior in both renderers.
 for renderer in ['', '&renderer=canvas']:
  reduced=browser.new_page(viewport={'width':1024,'height':768},device_scale_factor=2,reduced_motion='reduce')
  reduced.on('pageerror',lambda e:errors.append(str(e)));boot(reduced,renderer)
  for theme in range(7):
   pick(reduced,theme);before=snapshot(reduced);reduced.wait_for_timeout(100);assert before==snapshot(reduced)
   assert len(state(reduced)['world']['animalKinds'])>=6
  reduced.set_viewport_size({'width':390,'height':844})
  reduced.wait_for_function('(()=>{const c=document.querySelector("canvas"),r=c.getBoundingClientRect();return c.width===780&&c.height===1688&&r.width===390&&r.height===844})()')
  pick(reduced,0);select_activity(reduced,'[data-module="voyelles"]')
  assert reduced.locator('.adventure-answer').evaluate_all('bs=>bs.every(b=>b.scrollWidth<=b.clientWidth)')
  # A complete two-world session verifies new scenery lifetimes at transition/arrival.
  for _ in range(20):right(reduced)
  assert reduced.locator('#adventureFinish').is_visible()
  reduced.wait_for_function('document.querySelector("#rewardsDialog").open')
  assert reduced.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
  reduced.close()
  print(('Canvas' if renderer else 'WebGL')+': seven habitats, Retina rotation, reduced motion and full two-world adventure/reward passed',flush=True)
 assert not errors,errors
 browser.close()
 print('All living-world browser checks passed; no JavaScript errors',flush=True)
