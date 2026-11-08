// Compatibility entry point for running the first chapter's browser checks.
process.argv[2] = 'C1';
await import('./test-curriculum-complete-browser.mjs');
