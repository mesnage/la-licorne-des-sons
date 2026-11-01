"""Navigate the chapter menu before selecting an activity in browser checks."""
def select_activity(page, selector):
    button = page.locator(selector)
    chapter = button.get_attribute('data-chapter-id')
    if chapter and not button.is_visible():
        if page.locator('#chapterActivities').is_visible():
            page.locator('#chapterBack').click(no_wait_after=True)
        page.locator(f'[data-chapter="{chapter}"]').click(no_wait_after=True)
    button.click(no_wait_after=True)
