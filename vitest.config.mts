import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // No unit-testable business rules exist yet (Phase 0) — flip this off once P1 adds real tests.
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  // tsconfig.json sets jsx: "preserve" for Next's own compiler; Vite's oxc
  // transform (used for every file Vitest loads, including .tsx modules
  // pulled in transitively by a .ts test) reads that same tsconfig and
  // otherwise passes JSX through untransformed instead of compiling it.
  oxc: {
    jsx: { runtime: "automatic" },
  },
});
