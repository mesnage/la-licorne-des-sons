"""Real MP3/Phaser/UI checks for the new phoneme module and resettable local learning notebook."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8080');parser.add_argument('--screenshots',type=Path);args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
speech="""window.__spoken=0;window.SpeechSynthesisUtterance=class{};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(){window.__spoken++;},addEventListener(){},removeEventListener(){}}});"""
def state(page):return page.evaluate('window.__adventure.state()')
def shot(page,name):
 if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def boot(page):
 page.goto(args.url+'/?debug',wait_until='domcontentloaded');page.wait_for_function('window.__adventure?.state().ready',timeout=30000)
def choose(page,mode='phonemes',level=1):
 page.locator(f'[data-module="{mode}"]').click()
 if mode=='phonemes':page.locator(f'[data-phoneme-level="{level}"]').click()
def right(page):
 before=state(page);page.locator('[data-choice-id="'+before['targetId']+'"]').click();page.wait_for_function('(i)=>window.__adventure.state().index===i',arg=before['index']+1)
def leave(page):
 page.locator('#adventureHome').click();page.locator('#adventureLeave').click()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 errors=[];context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce');context.add_init_script(speech)
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));boot(page)
 assert page.locator('[data-module]').count()==7
 assert page.locator('.adventure-module .illustration').count()==7
 for level in [1,2,3]:
  choose(page,level=level);initial=state(page);key='phonemes:'+initial['targetId']
  assert initial['promptKey'].startswith('P:')
  expected='attentive' if initial['mastery'].get(key,{}).get('attempts',0) else 'curious'
  assert initial['world']['emotion']==expected
  page.wait_for_timeout(250);assert page.locator('#adventureAudioStatus').inner_text()==''
  for _ in range(3):page.locator('#listenBtn').click()
  page.locator('.adventure-answer:not([data-choice-id="'+initial['targetId']+'"])').first.click()
  page.wait_for_function('window.__adventure.state().phase==="question"')
  attempts=state(page)['mastery'][key]['attempts'];right(page)
  assert state(page)['mastery'][key]['attempts']==attempts,'checkpoint replay inflated evidence'
  for _ in range(9):right(page)
  page.wait_for_function('document.querySelector("#rewardsDialog").open')
  assert page.locator('#rewardWheel .illustration').count()==6
  page.locator('#rewardsClose').click();page.locator('#adventureChoose').click()
 assert page.evaluate('window.__spoken')==0
 print('Three phoneme stages, real recorded prompts/replay, independent evidence and reward spins passed',flush=True)
 # Decode every new MP3 in the actual browser, beyond checking that a filename exists.
 durations=page.evaluate("""async()=>{const {PHONEMES}=await import('./js/data/phonemes.js');const manifest=await(await fetch('audio/manifest.json')).json();const ctx=new OfflineAudioContext(1,1,16000);const durations=[];for(const key of PHONEMES.flatMap(p=>p.audio)){const r=await fetch('audio/'+manifest[key]);if(!r.ok)throw Error(key);const b=await ctx.decodeAudioData(await r.arrayBuffer());durations.push(b.duration);}return durations;}""")
 assert len(durations)==62 and min(durations)>1 and max(durations)<15
 print('All 62 phoneme MP3 files fetched and decoded by Chromium',flush=True)
 choose(page,'voyelles');right(page);leave(page)
 stored=page.evaluate('({rewards:localStorage.getItem("licorne.rewards.v1"),worlds:localStorage.getItem("licorne.adventure.v1")})')
 letters={k:v for k,v in state(page)['mastery'].items() if k.startswith('letters:')};assert letters
 page.set_viewport_size({'width':320,'height':568});page.locator('#progressOpen').click()
 assert page.locator('#progressSkills li').count()==31
 assert page.locator('#progressReset').evaluate('(b)=>{const r=b.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}')
 shot(page,'notebook-phone')
 before=state(page)['mastery'];page.locator('#progressReset').click();shot(page,'reset-confirm-phone');page.locator('#progressResetCancel').click();assert state(page)['mastery']==before
 page.locator('#progressReset').click();page.locator('#progressResetDo').click()
 assert state(page)['mastery']==letters
 assert page.locator('#progressResetStatus').inner_text().endswith('réinitialisés.')
 assert page.evaluate('localStorage.getItem("licorne.rewards.v1")')==stored['rewards']
 assert page.evaluate('localStorage.getItem("licorne.adventure.v1")')==stored['worlds']
 page.evaluate("async()=>{const {createWordProgress}=await import('./js/words/progress.js');createWordProgress(localStorage).complete('chat',true);}")
 page.locator('#progressScope').select_option('all');assert page.locator('#progressSkills li').count()==133
 page.locator('#progressReset').click();page.locator('#progressResetDo').click();page.locator('#progressClose').click()
 page.reload();page.wait_for_function('window.__adventure?.state().ready');assert state(page)['mastery']=={}
 assert page.evaluate('localStorage.getItem("licorne.words.v1")')=='{}'
 print('Visible reset controls, cancel, selective/all reset, reload persistence and protected gifts/worlds passed',flush=True)
 # Seven real scenes, with their seven distinct landmarks, still use the same world engine.
 for theme in range(7):
  page.evaluate('(n)=>localStorage.setItem("licorne.adventure.v1",JSON.stringify({worldsCompleted:n}))',theme)
  choose(page,'voyelles')
  for _ in range(8):right(page)
  assert state(page)['world']['theme']==theme
  page.set_viewport_size({'width':1280,'height':900});shot(page,f'world-{theme}');leave(page)
 print('All seven illustrated world themes and landmarks rendered',flush=True)
 # Normal-motion feedback keeps distinct, positive character reactions visible.
 actor=browser.new_page(viewport={'width':390,'height':844},has_touch=True)
 actor.add_init_script(speech);actor.on('pageerror',lambda e:errors.append(str(e)));boot(actor);choose(actor)
 assert state(actor)['world']['emotion']=='curious'
 first=state(actor);actor.locator('.adventure-answer:not([data-choice-id="'+first['targetId']+'"])').first.click()
 assert state(actor)['world']['emotion']=='encouraging'
 actor.locator('#adventureHome').click();actor.locator('#adventureResume').click()
 actor.wait_for_function('window.__adventure.state().phase==="question"')
 actor.locator('[data-choice-id="'+state(actor)['targetId']+'"]').click()
 assert state(actor)['world']['emotion']=='proud'
 actor.locator('#adventureHome').click();actor.locator('#adventureLeave').click();actor.close()
 print('Curious, encouraging and proud character reactions passed',flush=True)
 # Failed phoneme audio gives a useful generic hint, with no speech-synthesis or target-text fallback.
 failure=browser.new_page(reduced_motion='reduce');failure.add_init_script(speech);failure.on('pageerror',lambda e:errors.append(str(e)))
 failure.route('**/audio/phoneme-*.mp3',lambda route:route.abort());boot(failure);choose(failure)
 failure.wait_for_function('document.querySelector("#adventureAudioStatus").textContent.includes("n’a pas pu se charger")')
 assert failure.evaluate('window.__spoken')==0
 assert not errors,errors
 browser.close();print('Generic audio failure, no phoneme browser TTS and all learning browser checks passed')
