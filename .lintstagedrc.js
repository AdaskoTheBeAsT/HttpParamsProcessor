module.exports = {
  '{apps,libs}/**/*.html,!**/api/**': ['htmlhint', 'prettier --write'],
  '{apps,libs}/**/*.{css,scss},!**/api/**': [
    'stylelint --fix',
    'prettier --write',
  ],
  '{apps,libs}/**/*.{js,jsx,ts,tsx},!**/api/**': [
    'eslint --fix',
    'prettier --write',
  ],
  '{apps,libs}/**/*.{md,json},!**/api/**': ['prettier --write'],
};
