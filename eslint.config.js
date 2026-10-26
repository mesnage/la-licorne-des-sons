export default [
  {
    files: ['js/**/*.js', 'tools/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly',
        fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', AudioContext: 'readonly',
        requestAnimationFrame: 'readonly', console: 'readonly', process: 'readonly', location: 'readonly'
      }
    },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }], 'no-redeclare': 'error', 'no-const-assign': 'error' }
  }
];
