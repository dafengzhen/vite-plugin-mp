import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  perfectionist.configs['recommended-natural'],
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      curly: 'error',
    },
  },
);
