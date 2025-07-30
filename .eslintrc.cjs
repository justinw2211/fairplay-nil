module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React-specific bug prevention rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-danger': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'warn',
    'react/no-is-mounted': 'warn',
    'react/no-render-return-value': 'warn',
    'react/no-string-refs': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/no-unknown-property': 'warn',
    'react/no-unsafe': 'warn',
    'react/self-closing-comp': 'warn',
    'react/sort-comp': 'off', // Too strict for existing codebase
    'react/sort-prop-types': 'off', // Too strict for existing codebase
    'react/prop-types': 'off', // We can turn this off as we move to TypeScript or other solutions

    // JavaScript bug prevention rules
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'no-empty': 'warn',
    'no-extra-semi': 'error',
    'no-irregular-whitespace': 'error',
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'no-trailing-spaces': 'error',
    'no-unreachable': 'error',
    'no-unreachable-loop': 'error',
    'no-unsafe-negation': 'error',
    'no-unsafe-optional-chaining': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',

    // Async/await bug prevention rules
    'no-async-promise-executor': 'error',
    'require-await': 'warn',
    'no-promise-executor-return': 'error',
    'no-return-await': 'warn',
    'prefer-promise-reject-errors': 'error',

    // Common mistake prevention
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-dupe-else-if': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-imports': 'error',
    'no-func-assign': 'error',
    'no-import-assign': 'error',
    'no-obj-calls': 'error',
    'no-redeclare': 'error',
    'no-shadow': 'warn',
    'no-shadow-restricted-names': 'error',
    'no-unused-labels': 'error',
    'no-useless-catch': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-return': 'warn',

    // Code quality rules
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true }],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', 5],
    'max-statements': ['warn', 20],

    // Environment-specific rules
    ...(process.env.NODE_ENV === 'production' && {
      'no-console': 'error',
      'no-debugger': 'error',
    }),

    // React Refresh rules for development
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Test files have different rules
      files: ['**/*.test.js', '**/*.test.jsx', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'max-lines': 'off',
        'max-statements': 'off',
      },
    },
    {
      // Configuration files have different rules
      files: ['*.config.js', '*.config.cjs', 'vite.config.js'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
