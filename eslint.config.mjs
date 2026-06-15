import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

// Single flat config for the whole monorepo. ESLint v9+ searches ancestor
// directories for this file, so each package's `eslint .` script resolves it.
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.config.ts',
      // Generated CommonJS DB migrations — not part of the TS sources.
      'server/migrations/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Allow intentionally-unused args/vars when prefixed with `_`
  // (e.g. Express error handlers needing the 4th `next` param).
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  // Server + shared run on Node.
  {
    files: ['server/**/*.ts', 'shared/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Client runs in the browser; add React Hooks rules.
  {
    files: ['client/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
