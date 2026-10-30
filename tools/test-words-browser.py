"""Optional integration test: requires Python Playwright, Chromium and a running static server.
Speech is mocked for deterministic UI checks; listen on a real French-voice device before release.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8080')
parser.add_argument('--chromium', default='/usr/bin/chromium')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)

speech_mock = """
window.SpeechSynthesisUtterance = class {constructor(text){this.text=text;}};
window.__spoken = []; window.__cancels = 0; window.__activeVoice = 0;
Object.defineProperty(window, 'speechSynthesis', {configurable:true, value:{
 getVoices: () => [{lang:'en-US',localService:true},{lang:'fr-FR',localService:true}],
 cancel(){window.__cancels++;window.__activeVoice=0;},
 speak(u){window.__activeVoice++; if(window.__activeVoice>1) throw Error('Overlapping speech');
  window.__spoken.push({text:u.text,rate:u.rate,lang:u.lang});},
 addEventListener(){},removeEventListener(){}
}});
"""

def shot(page, name):
    if args.screenshots:
        page.screenshot(path=str(args.screenshots / (name + '.png')), full_page=True)

def open_game(page):
    page.goto(args.url + '/?debug', wait_until='domcontentloaded')
    page.wait_for_function('window.__licorneOK')
    page.locator('#wordActivityOpen').click()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.chromium, headless=True, args=['--no-sandbox'])
    errors = []
    context = browser.new_context(viewport={'width':390,'height':844}, has_touch=True, reduced_motion='reduce')
    context.add_init_script(speech_mock)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    open_game(page)
    shot(page, 'word-levels')
    assert page.locator('[data-word-level]').count() == 3
    page.clock.install()
    for level in range(1,4):
        page.locator(f'[data-word-level="{level}"]').click()
        previous = None
        for index in range(10):
            state = page.evaluate('window.__words.state()')
            assert state['index'] == index and state['phase'] == 'question'
            assert state['targetId'] != previous
            previous = state['targetId']
            cards = page.locator('.word-choice')
            assert cards.count() == 4
            assert len(set(cards.all_text_contents())) == 4
            assert cards.filter(has=page.locator('.word-check')).count() == 0
            if index == 0:
                for _ in range(5):
                    page.locator('#wordSpeaker').click()
                assert page.evaluate('window.__spoken.at(-1).lang') == 'fr-FR'
                assert page.evaluate('window.__spoken.at(-1).rate') == .8
                assert page.evaluate('window.__activeVoice') == 1
                shot(page, f'word-level-{level}-question')
            if index < 2:
                wrong = page.locator('.word-choice:not([data-word-id="' + state['targetId'] + '"])').first
                wrong.click(); wrong.click()
                assert page.evaluate('window.__words.state().index') == index
                assert 'Essaie encore' in page.locator('#wordFeedback').inner_text()
            page.locator(f'.word-choice[data-word-id="{state["targetId"]}"]').click()
            assert page.locator('.word-correct .word-check').count() == 1
            assert page.locator('.word-card-cheer').is_visible()
            assert page.locator('.word-choice:disabled').count() == 4
            assert page.locator('#wordProgress').get_attribute('aria-valuenow') == str(index+1)
            if index == 0:
                shot(page, f'word-level-{level}-correct')
            if index == 3:
                page.locator('#wordSpeaker').click()
                page.clock.run_for(1700)
                assert page.evaluate('window.__words.state().phase') == 'feedback'
                page.clock.run_for(3400)
            else:
                page.clock.run_for(1700)
        assert page.locator('#wordFinish').is_visible()
        assert page.locator('#rewardsDialog').evaluate('(d) => d.open')
        assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending') == 1
        # Closing/reopening offers the same earned spin, never a second spin.
        page.locator('#rewardsClose').click()
        page.locator('#wordReward').click()
        assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).pending') == 1
        page.locator('#spinReward').click()
        page.clock.run_for(200)
        assert page.locator('#spinReward').is_disabled()
        assert page.locator('#dailyTotal').inner_text() == str(level)
        page.locator('#rewardsClose').click()
        assert page.locator('#savingsOpen, #savingsDialog, #withdrawForm').count() == 0
        assert '8 mots sur 10 du premier coup' in page.locator('#wordScore').inner_text()
        assert page.evaluate('window.__words.state().phase') == 'finished'
        shot(page, 'word-finish')
        page.locator('#wordReplaySession').click()
        assert page.evaluate('window.__words.state().index') == 0
        assert page.evaluate('window.__words.state().score') == 0
        assert page.evaluate('window.__words.state().targetId') != previous
        page.locator('#wordPlayBack').click()
        page.clock.run_for(3000)
        assert page.locator('#wordLevels').is_visible()
        print(f'Level {level}: 10 questions, retries, 8/10 first-try score, one reward spin, replay and cancellation passed')
    saved = page.evaluate('localStorage.getItem("licorne.words.v1")')
    assert saved
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function('window.__licorneOK')
    assert page.evaluate('localStorage.getItem("licorne.words.v1")') == saved
    page.locator('#wordActivityOpen').click()
    page.locator('.word-practice summary').click()
    assert 'à revoir' in page.locator('#wordPractice').inner_text()
    page.locator('#wordLevelsHome').click()
    # Existing games still start, answer correctly, and return home.
    for mode in ['voyelles','consonnes','sons','experts','tout']:
        page.locator(f'[data-level="{mode}"]').click()
        assert page.locator('#cards button').count() == 3
        page.locator('#cards button').evaluate_all('(buttons) => buttons.find(b => b.dataset.g === window.__game.right()).click()')
        page.clock.run_for(4200)
        assert page.evaluate('window.__game.step()') == 1
        page.locator('#homeBtn').click()
    print('Saved practice survives reload; all five original game modes passed')
    # Real layouts, including longest words after all words have been introduced.
    for width,height in [(320,568),(390,844),(844,390),(768,1024),(1024,768)]:
        layout = context.new_page()
        layout.set_viewport_size({'width':width,'height':height})
        layout.on('pageerror', lambda e: errors.append(str(e)))
        layout.goto(args.url + '/?debug', wait_until='domcontentloaded')
        layout.wait_for_function('window.__licorneOK')
        layout.evaluate("""async () => {
          const {WORDS} = await import('./js/data/words.js');
          localStorage.setItem('licorne.words.v1', JSON.stringify(Object.fromEntries(WORDS.map(w => [w.id,{completed:1,firstTry:1,misses:0,streak:1}]))));
        }""")
        layout.locator('#wordActivityOpen').click()
        layout.locator('[data-word-level="3"]').click()
        layout.locator('.word-choice').evaluate_all("(cards) => cards.forEach((c,i) => { const text = ['aujourd’hui','maintenant','quelquefois','parce que'][i]; c.querySelector('span').textContent = text; c.classList.toggle('word-long',text.length>8); })")
        assert layout.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        assert layout.locator('.word-choice').evaluate_all('(cards) => cards.every(c => c.clientWidth >= c.scrollWidth && c.clientHeight >= c.scrollHeight && c.getBoundingClientRect().height >= 44)')
        assert layout.locator('#wordSpeaker').bounding_box()['height'] >= 44
        shot(layout, f'word-layout-{width}x{height}')
        layout.close()
    print('320px phone, mobile landscape, iPad portrait and landscape layouts passed')
    # Missing French voices never substitute English or expose an answer in a fallback.
    silent = browser.new_page(viewport={'width':390,'height':844})
    silent.add_init_script("Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},addEventListener(){},removeEventListener(){}}})")
    silent.on('pageerror', lambda e: errors.append(str(e)))
    open_game(silent)
    silent.locator('[data-word-level="1"]').click()
    assert 'voix française' in silent.locator('#wordAudioStatus').inner_text()
    assert silent.locator('.word-choice:enabled').count() == 4
    silent.locator('#wordSpeaker').click()
    assert 'voix française' in silent.locator('#wordAudioStatus').inner_text()
    print('No-French-voice fallback and replay passed without revealing the target')
    assert not errors, errors
    browser.close()
    print('All browser checks passed; French speech requests mocked, actual device listening still required')
