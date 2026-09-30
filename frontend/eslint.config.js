import { tanstackConfig } from '@tanstack/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default [
  ...tanstackConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { tailwindcss },
    settings: {
      tailwindcss: { cssConfigPath: './src/styles.css' },
    },
    rules: {
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/enforces-canonical-classname': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/important-modifier-suffix': 'warn',
      'tailwindcss/no-custom-classname': ['warn', { whitelist: ['app-theme'] }],
      'tailwindcss/no-contradicting-classname': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    ignores: [
      'dist',
      'eslint.config.js',
      'prettier.config.js',
      'src/routeTree.gen.ts',
    ],
  },
]
