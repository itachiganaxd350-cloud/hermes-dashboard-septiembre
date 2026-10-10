import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom")) return "react-dom";
          if (id.includes("node_modules/react")) return "react";
          if (id.includes("node_modules/recharts")) return "recharts";
          if (id.includes("node_modules/motion")) return "motion";
          if (id.includes("node_modules/lucide")) return "vendor";
          if (id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge")) return "vendor";
        },
      },
    },
  },
});
