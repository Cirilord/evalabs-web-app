/** @type {import('@commitlint/types').UserConfig} */
const commitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-list': (parsed) => {
          const body = parsed.body?.trim();

          if (!body) {
            return [false, 'body must include at least one list item'];
          }

          const lines = body.split('\n').filter((line) => line.trim());

          return [
            lines.every((line) => /^- .+/.test(line)),
            'body lines must be list items that start with "- "',
          ];
        },
      },
    },
  ],
  rules: {
    'body-leading-blank': [2, 'always'],
    'body-list': [2, 'always'],
  },
};

export default commitlintConfig;
