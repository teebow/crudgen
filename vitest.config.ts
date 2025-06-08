import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    setupFiles: ["./test/string-utils.ts"],
    exclude: [
      "**/generated/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
    ],
  },
});
