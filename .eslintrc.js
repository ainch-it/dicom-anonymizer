module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  plugins: ['prettier'],

  // Custom rules
  rules: {
    'no-unused-vars': 2,
    'no-undef': 2,
    'no-console': 'warn',
    'no-debugger': 'warn',
    'import/no-named-as-default': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
