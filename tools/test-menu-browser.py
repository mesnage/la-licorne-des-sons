"""Direct activity menu, real shared-narrator recordings and playback cancellation."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8080');parser.add_argument('--screenshots',type=Path);args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
monitor="""
window.__deviceSpeech=0;Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],speak(){window.__deviceSpeech++;throw Error('Unexpected device voice');},cancel(){},addEventListener(){},removeEventListener(){}}});
window.__playing=new Set();window.__starts=0;window.__maxVoices=0;
const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer?.duration>.01){window.__playing.add(this);window.__starts++;window.__maxVoices=Math.max(window.__maxVoices,window.__playing.size);this.addEventListener('ended',()=>window.__playing.delete(this));}return start.apply(this,args);};
AudioBufferSourceNode.prototype.stop=function(...args){window.__playing.delete(this);return stop.apply(this,args);};
"""
def shot(page,name):
 if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def boot(page):
 page.goto(args.url+'/?debug',wait_until='domcontentloaded');page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
def state(page):return page.evaluate('window.__adventure.state()')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 errors=[]
 page=browser.new_page(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce');page.add_init_script(monitor);page.on('pageerror',lambda e:errors.append(str(e)));boot(page)
 assert page.locator('#adventureModules > button').count()==8
 assert page.locator('#adventureModules > [data-word-level]').count()==3
 assert page.locator('#adventureLevels,#phonemeLevels,#progressNotebook,#progressOpen').count()==0
 shot(page,'menu-phone')
 for level in [1,2,3]:
  starts=page.evaluate('window.__starts');page.locator(f'[data-word-level="{level}"]').click()
  assert state(page)['mode']=='words' and state(page)['level']==level and state(page)['phase']=='question'
  assert state(page)['promptKey'].startswith('W:')
  page.wait_for_function('(n)=>window.__starts>n',arg=starts)
  for _ in range(5):page.locator('#listenBtn').click()
  page.wait_for_timeout(100)
  assert page.evaluate('window.__playing.size<=1&&window.__maxVoices<=1&&window.__deviceSpeech===0')
  assert page.locator('#adventureAudioStatus').inner_text()==''
  shot(page,f'word-level-{level}')
  page.locator('#adventureHome').click();assert page.evaluate('window.__playing.size')==0
  page.locator('#adventureLeave').click();page.wait_for_timeout(150);assert page.evaluate('window.__playing.size')==0
 print('All three word levels start directly; same recorded pipeline, no device speech and no overlapping playback passed',flush=True)
 durations=page.evaluate("""async()=>{const {WORDS}=await import('./js/data/words.js');const manifest=await(await fetch('audio/manifest.json')).json();const ctx=new OfflineAudioContext(1,1,16000);const out=[];for(const word of WORDS){const r=await fetch('audio/'+manifest[word.audioKey]);if(!r.ok)throw Error(word.id);const b=await ctx.decodeAudioData(await r.arrayBuffer());out.push(b.duration);}return out;}""")
 assert len(durations)==44 and min(durations)>1 and max(durations)<10
 print('All 44 full word prompts fetched and decoded by Chromium',flush=True)
 # The three word cards share the same layout and touch-target rules as the other activities.
 for w,h in [(320,568),(390,844),(844,390),(768,1024),(1280,900)]:
  page.set_viewport_size({'width':w,'height':h})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('#adventureModules button').evaluate_all('bs=>bs.every(b=>b.scrollWidth<=b.clientWidth&&b.getBoundingClientRect().height>=44)')
  if w==1280:
   page.locator('#adventureMenu').evaluate('(el)=>el.scrollTop=0');shot(page,'menu-desktop')
  page.locator('[data-word-level="3"]').click();assert page.locator('#adventureQuestion').is_visible()
  assert page.locator('.adventure-answer').evaluate_all('bs=>bs.every(b=>b.scrollWidth<=b.clientWidth&&b.getBoundingClientRect().height>=44)')
  page.locator('#adventureHome').click();page.locator('#adventureLeave').click()
 page.locator('#rewardPending').click();assert page.locator('#rewardsDialog').is_visible();page.locator('#rewardsClose').click()
 print('Direct menu and word cards fit phone/tablet/desktop portrait and landscape layouts',flush=True)
 # Failure cannot change the narrator or reveal a target as a text fallback.
 failure=browser.new_page(reduced_motion='reduce');failure.add_init_script(monitor);failure.on('pageerror',lambda e:errors.append(str(e)))
 failure.route('**/audio/mot-entier-*.mp3',lambda route:route.abort());boot(failure);failure.locator('[data-word-level="1"]').click()
 failure.wait_for_function('document.querySelector("#adventureAudioStatus").textContent.includes("n’a pas pu se charger")')
 assert failure.evaluate('window.__deviceSpeech')==0 and failure.locator('.adventure-answer:enabled').count()==4
 failure.unroute('**/audio/mot-entier-*.mp3');failure.locator('#listenBtn').click();failure.wait_for_function('window.__starts>0')
 assert failure.locator('#adventureAudioStatus').inner_text()==''
 assert not errors,errors
 browser.close();print('Generic recording failure/retry passed; the existing full-session suite verifies wheel rewards')
