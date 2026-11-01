import path from "node:path"
import { defineConfig } from "vitest/config"

const root = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(root, "backend/test/server-only-stub.ts"),
      "@": root,
    },
  },
  test: {
    environment: "node",
    include: ["backend/**/*.test.ts", "lib/**/*.test.ts"],
  },
})
