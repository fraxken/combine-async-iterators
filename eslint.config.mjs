import { ESLintConfig } from "@openally/config.eslint";

export default [
  ...ESLintConfig,
  {
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false
      }
    }
  }
]
