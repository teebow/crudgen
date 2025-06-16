import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const root = resolve(__dirname, "src");
// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@utils": resolve(root, "utils"),
      "@core": resolve(root, "core"),
      "@components": resolve(root, "components"),
    },
  },
  plugins: [react()],
});
