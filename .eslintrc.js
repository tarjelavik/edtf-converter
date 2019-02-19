module.exports = {
  env: {
    node: true
  },
  extends: 'google',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    'no-undef': 'error',
    'valid-jsdoc': 'off',
    'spaced-comment': ['error', 'always', { 'markers': ['/'] }]
  }
};
