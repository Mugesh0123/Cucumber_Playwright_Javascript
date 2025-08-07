module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Error handling
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Code quality
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-unreachable': 'error',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Async/Await
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'require-await': 'error',
    
    // Variables
    'no-var': 'error',
    'prefer-const': 'error',
    'no-const-assign': 'error',
    
    // Functions
    'no-empty-function': 'warn',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    
    // Objects and Arrays
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true
    }],
    
    // Strings
    'no-new-wrappers': 'error',
    'prefer-template': 'error',
    
    // Control flow
    'no-else-return': 'warn',
    'no-lonely-if': 'warn',
    'prefer-early-return': 'warn',
    
    // Spacing and formatting
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // Comments
    'spaced-comment': ['error', 'always'],
    
    // File organization
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-empty': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['step-definitions/**/*.js'],
      rules: {
        'no-console': 'off',
        'camelcase': 'off'
      }
    }
  ]
}; 