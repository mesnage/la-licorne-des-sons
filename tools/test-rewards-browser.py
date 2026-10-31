"""Optional integration check: pip install playwright; use system Chromium and a server on :8080."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844}, has_touch=True, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:8080/classic.html?debug', wait_until='domcontentloaded')
    page.wait_for_function('window.__licorneOK')
    page.clock.install()
    # Finish real 20-question adventures, without adding a production completion shortcut.
    for mode, roll in zip(['voyelles', 'consonnes', 'sons', 'experts', 'tout'], [.01, .40, .70, .90, .20]):
        page.locator('[data-level="' + mode + '"]').click()
        for step in range(20):
            assert page.evaluate('window.__game.step()') == step
            assert page.locator('#cards button:not(:disabled)').count() == 3
            assert page.locator('#cards button').evaluate_all('(buttons) => buttons.every(b => b.scrollWidth <= b.clientWidth)')
            if mode == 'experts' and len(page.evaluate('window.__game.right()')) == 4:
                page.screenshot(path='/workspace/scratch/phonics-experts.png')
            page.locator('#cards button').evaluate_all('(buttons) => buttons.find(b => b.dataset.g === window.__game.right()).click()')
            page.clock.run_for(4200)
        page.clock.run_for(2700)
        assert page.locator('#rewardsDialog').evaluate('(d) => d.open')
        assert page.locator('#spinReward').is_enabled()
        page.evaluate('(roll) => { window.savedRandom = Math.random; Math.random = () => roll; }', roll)
        page.locator('#spinReward').click(click_count=2)
        page.evaluate('Math.random = window.savedRandom')
        assert page.locator('#rewardsClose').is_disabled()
        page.clock.run_for(200)
        assert page.locator('#spinReward').is_disabled()
        assert page.locator('#rewardResult').inner_text()
        assert page.locator('#dailyTotal').inner_text() == str(['voyelles', 'consonnes', 'sons', 'experts', 'tout'].index(mode) + 1)
        if mode == 'tout':
            assert page.locator('#fartScene').is_visible()
            page.screenshot(path='/workspace/scratch/reward-wheel.png')
        page.locator('#rewardsClose').click()
        page.locator('#menuBtn').click()
        print(mode + ': 20 steps, victory, one spin, correct daily count')
    assert page.evaluate('JSON.parse(localStorage.getItem("licorne.rewards.v1")).counts') == [1, 1, 1, 2]
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function('window.__licorneOK')
    page.locator('#rewardPending').click()
    assert page.locator('#dailyTotal').inner_text() == '5'
    assert page.locator('#spinReward').is_disabled()
    page.locator('#rewardsClose').click()
    assert page.locator('#savingsOpen, #savingsDialog, #withdrawForm').count() == 0
    assert page.locator('#dailyPrizes li').count() == 4
    assert page.locator('#rewardWheel span').count() == 6
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    assert not errors, errors
    print('Reload persistence, six wheel segments, no savings controls, mobile layout: passed')
    # Exercise the normal-motion transition as well as the reduced-motion mobile path.
    desktop = browser.new_page(viewport={'width': 1280, 'height': 900})
    desktop.on('pageerror', lambda error: errors.append(str(error)))
    desktop.goto('http://127.0.0.1:8080/classic.html?debug', wait_until='domcontentloaded')
    desktop.wait_for_function('window.__licorneOK')
    desktop.evaluate("async () => { const r = await import('./js/rewards.js'); r.earnReward(); r.showReward(); Math.random = () => .2; }")
    desktop.locator('#spinReward').click()
    assert desktop.locator('#spinReward').is_disabled()
    desktop.wait_for_function("document.querySelector('#rewardResult').textContent.includes('prout')")
    assert desktop.locator('#fartScene').is_visible()
    assert desktop.locator('#spinReward').is_disabled()
    assert not errors, errors
    print('Normal-motion desktop wheel and animated unicorn reveal: passed')
    browser.close()
