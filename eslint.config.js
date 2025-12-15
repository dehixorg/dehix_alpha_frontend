// @ts-check
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

const isProduction = process.env.NODE_ENV === 'production';

// Common rules that apply to all files
const commonRules = {
  'no-debugger': isProduction ? 'error' : 'warn',
  'no-var': 'error',
  'prefer-const': 'error',
  'no-extra-semi': 'error',
  'semi': ['error', 'always'],
  'quotes': ['error', 'single', { 'avoidEscape': true }],
  // Disable rules that are handled by TypeScript
  'no-undef': 'off',
  'no-unused-vars': 'off',
  // React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
  // Prettier
  'prettier/prettier': 'error',
};

export default [
  // Global ignores
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/public/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.cjs',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },
  
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': isProduction ? 'error' : 'off',
      '@typescript-eslint/no-unused-vars': [
        isProduction ? 'error' : 'warn',
        { 
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      
      // Console handling
      'no-console': isProduction 
        ? ['error', { allow: ['warn', 'error'] }]
        : 'off',
        
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  
  // JavaScript configuration
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
    },
  },
  
  // Common rules for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'prettier': prettierPlugin,
    },
    rules: commonRules,
  },
  
  // Apply Prettier last to override other configs
  {
    ...prettier,
    rules: {
      ...prettier.rules,
      // Disable Prettier rules that conflict with ESLint
      'prettier/prettier': 'off',
    },
  }
];
