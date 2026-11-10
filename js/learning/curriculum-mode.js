const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function reviewMode(url) {
  return localHosts.has(url.hostname) && url.searchParams.get('test') === '1';
}

// Previously shared review links should open the normal adventure online.
export function curriculumLocation() {
  const url = new window.URL(location.href);
  if (!reviewMode(url) && (url.searchParams.has('test') || url.searchParams.has('bloc'))) {
    url.searchParams.delete('test');
    url.searchParams.delete('bloc');
    window.history.replaceState(null, '', url);
  }
  return url;
}
