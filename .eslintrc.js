module.exports = {
  env: {
    node: true
  },
  extends: 'google',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    'no-undef': 'error'
  }
};
