module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error'
    },
    globals: {
        'window': 'readonly',
        'document': 'readonly',
        'console': 'readonly'
    }
};
