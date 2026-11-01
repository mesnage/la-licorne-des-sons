"""Render the longest vocabulary through both actual word-game interfaces."""
from browser_menu import select_activity
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--browser-path', default='/usr/bin/chromium')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)

# Reorder only this test page's in-memory vocabulary, so new words are eligible
# immediately without altering the saved progress or adding production debug APIs.
prepare = """async ({level, phrases}) => {
  const {WORDS} = await import('./js/data/words.js');
  window.__originalWords ||= [...WORDS];
  const candidates = window.__originalWords.filter(w => w.level === level &&
    (phrases ? w.text.includes(' ') || w.text.includes('-') :
      !w.text.includes(' ') && !w.text.includes('-')))
    .sort((a,b) => b.text.length-a.text.length);
  WORDS.splice(0, WORDS.length, ...candidates,
    ...window.__originalWords.filter(w => !candidates.includes(w)));
  Math.random = () => 0;
  return candidates[0].id;
}"""
fits = """buttons => buttons.map(button => {
  const text=button.querySelector('span'), b=button.getBoundingClientRect(),
    t=text.getBoundingClientRect();
  return {text:text.textContent, fits:button.scrollWidth<=button.clientWidth &&
    t.left>=b.left && t.right<=b.right && t.top>=b.top && t.bottom<=b.bottom,
    touch:b.height>=44};
})"""

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, headless=True)
    errors = []
    for classic in [False, True]:
        page = browser.new_page(has_touch=True, reduced_motion='reduce')
        page.add_init_script("""window.__wordStarts=0;
          const start=AudioBufferSourceNode.prototype.start;
          AudioBufferSourceNode.prototype.start=function(...args){
            if(this.buffer?.duration>.01)window.__wordStarts++;
            return start.apply(this,args);
          };""")
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(args.url + ('/classic.html?debug' if classic else '/?debug'), wait_until='domcontentloaded')
        page.wait_for_function('window.__licorneOK' if classic else 'window.__adventure?.state().ready')
        for width, height in [(320,568),(390,844),(844,390),(768,1024),(1280,900)]:
            page.set_viewport_size({'width':width,'height':height})
            for level, phrases in [(1,False),(2,False),(3,False),(3,True)]:
                target = page.evaluate(prepare, {'level':level,'phrases':phrases})
                starts = page.evaluate('window.__wordStarts')
                select_activity(page,f'[data-word-level="{level}"]')
                state = page.evaluate('window.__words.state()' if classic else 'window.__adventure.state()')
                assert state['targetId'] == target, state
                page.wait_for_function('(starts)=>window.__wordStarts>starts', arg=starts)
                assert page.locator('#wordAudioStatus' if classic else '#adventureAudioStatus').inner_text()==''
                cards = page.locator('.word-choice' if classic else '.adventure-answer')
                checks = cards.evaluate_all(fits)
                assert len(checks)==4 and all(c['fits'] and c['touch'] for c in checks), (classic,width,height,checks)
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (classic,width,height)
                if args.screenshots and level==3:
                    page.screenshot(path=str(args.screenshots/f'{"classic" if classic else "main"}-{width}-{height}-{"phrases" if phrases else "words"}.png'), full_page=True)
                if classic:
                    page.locator('#wordPlayBack').click(no_wait_after=True)
                else:
                    page.locator('#adventureHome').click(no_wait_after=True)
                    page.locator('#adventureLeave').click(no_wait_after=True)
        page.close()
    assert not errors, errors
    browser.close()
    print('Longest words and expressions fit both interfaces across five phone/tablet/desktop layouts')
