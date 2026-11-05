"""Approved phoneme playback, answer flow and phone layout (local public preview)."""
import argparse
from playwright.sync_api import sync_playwright
from browser_menu import select_activity
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--browser-path', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
args = parser.parse_args()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser_path, headless=True)
    page = browser.new_page(viewport={'width':390, 'height':844}, has_touch=True, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(args.url+'/?debug')
    page.wait_for_function('window.__adventure?.state().ready')
    select_activity(page, '[data-activity-id="listen-phonemes"]')
    page.wait_for_function('window.__adventure.state().promptKey.startsWith("P:robin:")')
    assert page.locator('.phoneme-answer').count() == 3
    assert page.locator('.phoneme-answer small').count() == 0
    assert page.locator('.phoneme-highlight').count() == 3
    page.locator('#listenBtn').click()
    page.wait_for_timeout(700)
    assert page.locator('#adventureAudioStatus').inner_text() == ''
    decoded = page.evaluate('''async()=>{
      const m=await (await fetch('audio/manifest.json')).json(),ctx=new AudioContext();
      const keys=Object.keys(m).filter(k=>k.startsWith('P:robin:'));
      for(const key of keys){const r=await fetch('audio/'+m[key]);if(!r.ok)throw Error(key);const b=await ctx.decodeAudioData(await r.arrayBuffer());if(!b.duration)throw Error(key);}
      await ctx.close();return keys.length;
    }''')
    assert decoded == 36
    for width,height in [(320,568),(390,844),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        assert page.locator('.phoneme-answer').evaluate_all('bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=44&&b.scrollWidth<=b.clientWidth;})')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path='/tmp/licorne-phonemes-phone.png')
    target = page.evaluate('window.__adventure.state().targetId')
    page.locator('[data-choice-id="'+target+'"]').click()
    page.wait_for_function('window.__adventure.state().index===1 && window.__adventure.state().phase==="question"', timeout=30000)
    assert not errors, errors
    browser.close()
    print('PASS: 36 clips decode, phoneme prompt/replay, three choices, responsive layout and correct-answer progression')
