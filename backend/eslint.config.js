import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    files: ["**/*.js", "**/*.mjs"],
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**",
      "**/*.zip",
    ],
    rules: {
      // Variables
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-use-before-define": "off",

      // Best practices
      "no-console": "off",
      "no-debugger": "warn",
      "no-empty": "warn",
      "no-extra-semi": "warn",
      "no-unreachable": "error",
      "no-constant-condition": "warn",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty-pattern": "warn",
      "no-redeclare": "error",
      "no-self-assign": "warn",
      "no-useless-escape": "warn",

      // ES6+
      "no-var": "warn",
      "prefer-const": "warn",
      "no-duplicate-imports": "error",

      // Style (minimal - just for catching issues)
      "no-mixed-spaces-and-tabs": "warn",
      "no-trailing-spaces": "off",
      semi: "off",
      quotes: "off",
    },
  },
  {
    // Special config for Lambda layer imports (allow /opt/nodejs paths)
    files: [
      "modules/**/*.js",
      "modules/**/*.mjs",
      "lambdaLayer/**/*.js",
      "lambdaLayer/**/*.mjs",
    ],
    rules: {
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
