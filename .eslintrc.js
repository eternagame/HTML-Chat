module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb-with-typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: 'off',
    'no-param-reassign': ['error', { props: false }],
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
    'no-unused-vars': 'off',
    'arrow-parens': 'off',
    'no-underscore-dangle': ['error', { allow: ['__INITIAL_STATE__'] }],
    'no-plusplus': 'off',
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off',
    'no-unused-expressions': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        'tests/unit/*.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.js'],
      parserOptions: {
        parser: 'espree',
      },
    },
    {
      files: [
        'src/app/types/modules/**/*.d.ts',
      ],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
