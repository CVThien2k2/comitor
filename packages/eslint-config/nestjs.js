import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"
import turboPlugin from "eslint-plugin-turbo"
import onlyWarn from "eslint-plugin-only-warn"

/**
 * @param {string} dirname - đường dẫn tuyệt đối đến thư mục gốc của app (truyền import.meta.dirname)
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function nestJsConfig(dirname) {
  return tseslint.config(
    { ignores: ["dist/**", ".turbo/**", "coverage/**"] },
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommendedTypeChecked,
    {
      plugins: { turbo: turboPlugin },
      rules: { "turbo/no-undeclared-env-vars": "warn" },
    },
    { plugins: { onlyWarn } },
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: "commonjs",
        parserOptions: {
          projectService: true,
          tsconfigRootDir: dirname,
        },
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "warn",
      },
    }
  )
}
