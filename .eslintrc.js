module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/script-indent': ['error', 2, {
      baseIndent: 1,
      switchCase: 1,
      ignores: [],
    }],

  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
    {
      files: ['*.vue', '*.ts'],
      rules: {
        'no-param-reassign': ['error', { "props": false }],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      },
    },
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
};
