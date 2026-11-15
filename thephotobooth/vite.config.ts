import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
const projectDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(projectDir, "./src"),
      "@types": path.resolve(projectDir, "./src/types"),
      "@store": path.resolve(projectDir, "./src/store"),
      "@hooks": path.resolve(projectDir, "./src/hooks"),
      "@utils": path.resolve(projectDir, "./src/utils"),
      "@ui": path.resolve(projectDir, "./src/components/ui"),
      "@steps": path.resolve(projectDir, "./src/components/steps"),
      "@assets": path.resolve(projectDir, "./src/assets"),
    },
  },
});
