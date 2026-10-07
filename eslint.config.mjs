import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/prisma/**',
    'public/sqlite/**',
    'src/generated/prisma-browser/**',
    'src/generated/prisma-server/**',
  ]),
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/default': 'error',
      'import/export': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          'groups': [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], 'object'],
          'pathGroupsExcludedImportTypes': ['builtin'],
          'newlines-between': 'always',
          'alphabetize': {
            caseInsensitive: true,
            order: 'asc',
          },
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXElement > JSXExpressionContainer > ConditionalExpression[alternate.value=null]',
          message: 'Use && instead of a ternary expression with null in JSX.',
        },
      ],
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
    },
  },
  {
    files: ['**/page.tsx', '**/layout.tsx', '**/*.config.js', '**/*.config.mjs', '**/*.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
]);

export default eslintConfig;
