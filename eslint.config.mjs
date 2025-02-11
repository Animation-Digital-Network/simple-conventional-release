import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import * as importPlugin from 'eslint-plugin-import';
import checkFile from 'eslint-plugin-check-file';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    ignores: ['dist'],
    extends: [
      importPlugin.flatConfigs?.recommended,
      importPlugin.flatConfigs?.warnings,
      importPlugin.flatConfigs?.errors,
      importPlugin.flatConfigs?.typescript,
    ],
    plugins: {
      '@stylistic': stylistic,
      prettier: eslintPluginPrettier,
      'check-file': checkFile,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      'no-throw-literal': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-promise-executor-return': 'error',
      'require-atomic-updates': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['./tests/*'],
        },
      ],
      'no-nested-ternary': 'error',
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
        },
      ],
      '@stylistic/eol-last': 'error',
      '@stylistic/no-tabs': 'error',
      'check-file/no-index': 'error',
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.ts': 'KEBAB_CASE',
          'tests/**/*.test.ts': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
          'tests/**/': 'KEBAB_CASE',
        },
      ],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'typeMethod',
          format: ['camelCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'classMethod',
          format: ['camelCase'],
        },
        {
          selector: 'classProperty',
          format: ['camelCase'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
        },
        {
          selector: 'parameterProperty',
          format: ['camelCase'],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
