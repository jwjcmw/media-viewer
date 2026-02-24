import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "ui",
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  build: { outDir: "../dist-ui" },
});
