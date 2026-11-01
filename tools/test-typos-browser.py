"""Find one spelling error in three words: feedback, narration, journey and small screens."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080')
parser.add_argument('--browser-path',default='/usr/bin/chromium')
parser.add_argument('--screenshots',type=Path)
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
def labels(words):return [word.capitalize() if index==0 else word+('.' if index==2 else '') for index,word in enumerate(words)]
def correct(page,pause_feedback=False):
 current=state(page);expected=labels(current['typo']['words'])
 assert page.locator('.adventure-answer').count()==3
 assert sum(actual!=proper for actual,proper in zip(page.locator('.adventure-answer').all_text_contents(),expected))==1
 assert not page.locator('#typoCorrection').is_visible() and page.locator('#typoCorrection').inner_text()==''
 page.locator('[data-choice-id="'+current['targetId']+'"]').click(no_wait_after=True)
 assert state(page)['phase']=='feedback' and state(page)['index']==current['index']
 assert page.locator('.adventure-answer').all_text_contents()==expected
 assert page.locator('.adventure-answer:disabled').count()==3
 assert page.locator('#typoCorrection').is_visible()
 assert ' '.join(expected) in page.locator('#typoCorrection').inner_text()
 if pause_feedback:
  shot(page,'corrected-sentence')
  page.locator('#adventureHome').click(no_wait_after=True)
  page.wait_for_timeout(2100)
  assert state(page)['paused'] and state(page)['index']==current['index']
  page.locator('#adventureResume').click(no_wait_after=True)
 page.wait_for_function('(index)=>window.__adventure.state().index===index',arg=current['index']+1)
def leave(page):
 page.locator('#adventureHome').click(no_wait_after=True);page.locator('#adventureLeave').click(no_wait_after=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=args.browser_path,headless=True)
 context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
 context.add_init_script(monitor)
 errors=[];page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));boot(page)
 assert page.locator('[data-module]').count()==13
 assert page.locator('#adventureModules button').first.get_attribute('data-module')=='find-typo'
 shot(page,'menu-with-typo')
 page.locator('[data-typo-mode]').click(no_wait_after=True)
 page.wait_for_function('window.__starts>0')
 current=state(page)
 assert current['mode']=='find-typo' and current['promptKey'].startswith('S:') and current['total']==10
 assert not page.locator('#sentenceWorkbench').is_visible()
 assert page.locator('#adventureAudioStatus').inner_text()==''
 assert page.locator('.adventure-answer').evaluate_all('buttons=>new Set(buttons.map(button=>getComputedStyle(button).backgroundColor)).size===1')
 shot(page,'find-the-typo')
 for _ in range(3):page.locator('#listenBtn').click(no_wait_after=True)
 assert page.evaluate('window.__playing.size<=1&&window.__deviceSpeech===0')
 page.locator('#adventureHome').click(no_wait_after=True)
 assert state(page)['paused'] and page.evaluate('window.__playing.size')==0
 page.locator('#adventureResume').click(no_wait_after=True);assert state(page)['targetId']==current['targetId']
 page.locator('#worldName').click(no_wait_after=True);page.locator('[data-world-id="1"]').click(no_wait_after=True)
 assert state(page)['targetId']==current['targetId'] and state(page)['index']==0
 correct(page,pause_feedback=True)
 while state(page)['index']<7:correct(page)
 current=state(page)
 page.locator('.adventure-answer:not([data-choice-id="'+current['targetId']+'"])').first.click(no_wait_after=True)
 page.wait_for_function('window.__adventure.state().index===5&&window.__adventure.state().phase==="question"')
 assert state(page)['world']['crystals']==5 and not page.locator('#typoCorrection').is_visible()
 while state(page)['phase']!='finished':correct(page)
 assert state(page)['score']==9 and state(page)['mastery']=={}
 page.wait_for_function('document.querySelector("#rewardsDialog").open')
 assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending')==1
 practice=page.evaluate('JSON.parse(localStorage.getItem("licorne.typos.v1"))')
 assert sum(stat['completed'] for stat in practice.values())==10
 assert sum(stat['misses'] for stat in practice.values())==1
 assert page.evaluate('localStorage.getItem("licorne.words.v1")===null&&localStorage.getItem("licorne.sentences.v1")===null')
 page.locator('#rewardsClose').click(no_wait_after=True);page.locator('#adventureChoose').click(no_wait_after=True)
 print('Exactly one typo, correction feedback, pause/picker, refuge replay, saved practice and one reward passed',flush=True)
 # Force the longest source sentence into the next session, still through the real UI.
 for width,height in [(320,568),(390,844),(459,724),(844,390),(768,1024),(1280,900)]:
  page.set_viewport_size({'width':width,'height':height})
  page.evaluate("""async()=>{const {TYPO_SENTENCES}=await import('./js/data/typos.js');TYPO_SENTENCES.sort((a,b)=>b.sentence.text.length-a.sentence.text.length);Math.random=()=>0;}""")
  page.locator('[data-typo-mode]').click(no_wait_after=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('.adventure-answer').evaluate_all('buttons=>buttons.every(button=>button.scrollWidth<=button.clientWidth&&button.getBoundingClientRect().height>=44)')
  assert page.locator('#adventureQuestion').evaluate('(panel)=>panel.getBoundingClientRect().top>=60&&panel.getBoundingClientRect().bottom<=innerHeight')
  shot(page,f'typo-{width}-{height}')
  current=state(page);page.locator('[data-choice-id="'+current['targetId']+'"]').click(no_wait_after=True)
  assert page.locator('#typoCorrection').evaluate('(text)=>text.scrollWidth<=text.clientWidth')
  shot(page,f'correction-{width}-{height}')
  leave(page)
 # Other activities must not inherit typo instructions or spelling corrections.
 for selector in ['[data-sentence-mode="sentence-copy-3"]','[data-word-level="1"]','[data-module="voyelles"]']:
  page.locator(selector).click(no_wait_after=True)
  assert not page.locator('#typoInstruction').is_visible() and not page.locator('#typoCorrection').is_visible()
  assert page.locator('#typoCorrection').inner_text()==''
  leave(page)
 durations=page.evaluate("""async()=>{const {TYPO_SENTENCES}=await import('./js/data/typos.js'),manifest=await(await fetch('audio/manifest.json')).json(),ctx=new OfflineAudioContext(1,1,16000);return Promise.all(TYPO_SENTENCES.map(async item=>{const response=await fetch('audio/'+manifest[item.sentence.audioKey]);if(!response.ok)throw Error(item.sentence.id);return(await ctx.decodeAudioData(await response.arrayBuffer())).duration;}));}""")
 assert len(durations)==24 and min(durations)>.5 and max(durations)<10
 failure=context.new_page();failure.on('pageerror',lambda error:errors.append(str(error)))
 failure.route('**/audio/phrase-*.mp3',lambda route:route.abort());boot(failure)
 failure.locator('[data-typo-mode]').click(no_wait_after=True)
 failure.wait_for_function('document.querySelector("#adventureAudioStatus").textContent.includes("n’a pas pu se charger")')
 assert not failure.locator('#typoCorrection').is_visible() and failure.locator('#typoCorrection').inner_text()==''
 assert failure.locator('.adventure-answer:enabled').count()==3
 failure.unroute('**/audio/phrase-*.mp3');failure.locator('#listenBtn').click(no_wait_after=True)
 failure.wait_for_function('window.__starts>0');assert failure.locator('#adventureAudioStatus').inner_text()==''
 leave(failure);assert failure.evaluate('window.__playing.size')==0
 assert not errors,errors
 browser.close();print('Phone/tablet/desktop layouts, 24 real recordings, activity switching and recording failure/retry passed',flush=True)
