"""Real sentence ordering, narration, checkpoint/reward accounting and responsive layout."""
from browser_menu import select_activity
import argparse
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--browser-path',default='/usr/bin/chromium')
parser.add_argument('--screenshots',type=Path)
parser.add_argument('--layouts-only',action='store_true')
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
monitor="""window.__starts=0;window.__playing=new Set();window.__deviceSpeech=0;
Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],speak(){window.__deviceSpeech++;throw Error('Unexpected device speech');},cancel(){},addEventListener(){},removeEventListener(){}}});
const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer?.duration>.01){window.__starts++;window.__playing.add(this);this.addEventListener('ended',()=>window.__playing.delete(this));}return start.apply(this,args);};
AudioBufferSourceNode.prototype.stop=function(...args){window.__playing.delete(this);return stop.apply(this,args);};"""
def state(page):return page.evaluate('window.__adventure.state()')
def boot(page):
 page.goto(args.url+'/?debug',wait_until='domcontentloaded')
 page.wait_for_function('window.__adventure?.state().ready')
def shot(page,name):
 if args.screenshots:page.screenshot(path=str(args.screenshots/(name+'.png')))
def tile(page,word):return page.locator('.adventure-answer:enabled').filter(has_text=re.compile('^'+re.escape(word)+'$')).first
def leave(page):
 page.locator('#adventureHome').click(no_wait_after=True);page.locator('#adventureLeave').click(no_wait_after=True)
def solve(page):
 current=state(page)
 for position in range(len(current['selected']),len(current['sentenceWords'])):
  tile(page,current['sentenceWords'][position]).click(no_wait_after=True)
  if position<len(current['sentenceWords'])-1:
   actual=state(page);assert actual['index']==current['index'] and actual['phase']=='question'
   assert len(actual['selected'])==position+1
   assert page.locator('#sentenceAssembly .filled').count()==position+1
 assert state(page)['phase']=='feedback'
 page.wait_for_function('(index)=>window.__adventure.state().index===index',arg=current['index']+1)

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=args.browser_path,headless=True)
 errors=[]
 context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
 context.add_init_script(monitor)
 page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));boot(page)
 assert page.locator('[data-sentence-mode]').count()==4
 modes=['sentence-copy-3','sentence-copy-5','sentence-listen-3','sentence-listen-5']
 for number,mode in enumerate([] if args.layouts_only else modes,1):
  starts=page.evaluate('window.__starts')
  select_activity(page,f'[data-sentence-mode="{mode}"]')
  page.wait_for_function('(starts)=>window.__starts>starts',arg=starts)
  current=state(page);length=int(mode[-1]);hidden='listen' in mode
  assert len(current['sentenceWords'])==length and current['promptKey'].startswith('S:')
  assert page.locator('.adventure-answer').count()==length
  assert page.locator('.adventure-answer').all_text_contents()!=current['sentenceWords']
  assert page.locator('#sentenceTarget').inner_text()==('' if hidden else ' '.join(current['sentenceWords']).capitalize()+'.')
  assert page.locator('#sentenceModel').is_visible()!=hidden
  assert page.locator('#adventureAudioStatus').inner_text()==''
  shot(page,mode+'-start')
  # Replays and partial construction cannot overlap recordings or advance the journey.
  for _ in range(3):page.locator('#listenBtn').click(no_wait_after=True)
  assert page.evaluate('window.__playing.size<=1&&window.__deviceSpeech===0')
  tile(page,current['sentenceWords'][0]).click(no_wait_after=True)
  partial=state(page);assert partial['index']==0 and len(partial['selected'])==1 and partial['score']==0
  used=page.locator('.adventure-answer:disabled').first
  used.evaluate('(button)=>button.click()');assert state(page)['selected']==partial['selected']
  page.locator('#adventureHome').click(no_wait_after=True)
  assert state(page)['paused'] and page.evaluate('window.__playing.size')==0
  page.locator('#adventureResume').click(no_wait_after=True);assert state(page)['selected']==partial['selected']
  page.locator('#worldName').click(no_wait_after=True)
  page.locator('[data-world-id="1"]').click(no_wait_after=True)
  assert state(page)['selected']==partial['selected'] and state(page)['index']==0
  solve(page)
  for _ in range(6):solve(page)
  # Error after a partial answer rolls back to refuge 5; replayed questions earn no extra credits.
  current=state(page);assert current['index']==7
  tile(page,current['sentenceWords'][0]).click(no_wait_after=True)
  wrong=next(word for word in page.locator('.adventure-answer:enabled').all_text_contents() if word!=current['sentenceWords'][1])
  tile(page,wrong).click(no_wait_after=True)
  page.wait_for_function('window.__adventure.state().index===5&&window.__adventure.state().phase==="question"')
  assert state(page)['selected']==[] and state(page)['world']['crystals']==5
  while state(page)['phase']!='finished':solve(page)
  assert state(page)['score']==9
  page.wait_for_function('document.querySelector("#rewardsDialog").open')
  assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==number
  practice=page.evaluate('(mode)=>Object.entries(JSON.parse(localStorage.getItem("licorne.sentences.v1"))).filter(([key])=>key.startsWith(mode+":"))',mode)
  assert sum(stat['completed'] for _,stat in practice)==10
  assert sum(stat['misses'] for _,stat in practice)==1
  assert page.evaluate('localStorage.getItem("licorne.words.v1")') is None
  shot(page,mode+'-finished')
  page.locator('#rewardsClose').click(no_wait_after=True);page.locator('#adventureChoose').click(no_wait_after=True)
  print(mode+': ordered tiles, partial answers, pause/world picker, refuge and exactly one reward passed',flush=True)
 # Decode every real sentence file, including sentences not chosen in these sessions.
 durations=page.evaluate("""async()=>{const {SENTENCES}=await import('./js/data/sentences.js'),manifest=await(await fetch('audio/manifest.json')).json(),ctx=new OfflineAudioContext(1,1,16000);return Promise.all(SENTENCES.map(async sentence=>{const response=await fetch('audio/'+manifest[sentence.audioKey]);if(!response.ok)throw Error(sentence.id);return(await ctx.decodeAudioData(await response.arrayBuffer())).duration;}));}""")
 assert len(durations)==48 and min(durations)>.5 and max(durations)<10
 print('All 48 recorded sentences fetched and decoded',flush=True)
 # Real longest sentences in both presentation modes, at narrow portrait and landscape sizes.
 for width,height in [(320,568),(390,844),(844,390),(768,1024),(1280,900)]:
  page.set_viewport_size({'width':width,'height':height})
  for mode in modes:
   page.evaluate("""async()=>{const {SENTENCES}=await import('./js/data/sentences.js');SENTENCES.sort((a,b)=>b.text.length-a.text.length);Math.random=()=>0;}""")
   select_activity(page,f'[data-sentence-mode="{mode}"]')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert page.locator('.adventure-answer').evaluate_all('buttons=>buttons.every(button=>button.scrollWidth<=button.clientWidth&&button.getBoundingClientRect().height>=44)')
   assert page.locator('#adventureQuestion').evaluate('(panel)=>panel.getBoundingClientRect().top>=60&&panel.scrollWidth<=panel.clientWidth')
   for word in state(page)['sentenceWords'][:-1]:tile(page,word).click(no_wait_after=True)
   assert page.locator('#sentenceAssembly').evaluate('(assembly)=>assembly.scrollWidth<=assembly.clientWidth')
   if (width,height) in [(320,568),(844,390)]:
    assert page.locator('#adventureQuestion').evaluate('(panel)=>panel.scrollHeight<=panel.clientHeight'), (mode,width,height)
   shot(page,f'{mode}-{width}-{height}')
   leave(page)
 # Returning to the original activities restores their choices and audio pipeline.
 for mode,choices,prefix in [('voyelles',3,'w:'),('words',4,'W:')]:
  select_activity(page,'[data-word-level="1"]' if mode=='words' else '[data-module="voyelles"]')
  current=state(page);assert current['promptKey'].startswith(prefix)
  assert page.locator('.adventure-answer').count()==choices and not page.locator('#sentenceWorkbench').is_visible()
  page.locator('[data-choice-id="'+current['targetId']+'"]').click(no_wait_after=True)
  page.wait_for_function('window.__adventure.state().index===1&&window.__adventure.state().phase==="question"')
  leave(page)
 # A missing listening prompt never exposes the model or switches to device speech.
 failure=context.new_page();failure.on('pageerror',lambda error:errors.append(str(error)))
 failure.route('**/audio/phrase-*.mp3',lambda route:route.abort());boot(failure)
 select_activity(failure,'[data-sentence-mode="sentence-listen-5"]')
 failure.wait_for_function('document.querySelector("#adventureAudioStatus").textContent.includes("n’a pas pu se charger")')
 assert failure.locator('#sentenceTarget').inner_text()=='' and not failure.locator('#sentenceModel').is_visible()
 assert failure.locator('.adventure-answer:enabled').count()==5
 failure.unroute('**/audio/phrase-*.mp3');failure.locator('#listenBtn').click(no_wait_after=True)
 failure.wait_for_function('window.__starts>0');assert failure.locator('#adventureAudioStatus').inner_text()==''
 leave(failure);assert failure.evaluate('window.__playing.size')==0
 assert not errors,errors
 browser.close();print('Responsive layouts, hidden-model privacy and recording failure/retry passed',flush=True)
