import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const noComments = {
  meta: { type: "problem", schema: [], messages: { comment: "Code comments are not allowed." } },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type === "Shebang") continue
          context.report({ loc: comment.loc, messageId: "comment" })
        }
      },
    }
  },
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { local: { rules: { "no-comments": noComments } } },
    rules: {
      "local/no-comments": "error",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["eslint.config.mjs", "scripts/**"],
    rules: { "local/no-comments": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "fixtures/**",
    "public/**",
    ".verify/**",
  ]),
])

export default eslintConfig
