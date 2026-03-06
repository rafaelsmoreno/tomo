import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // needed for Docker
    port: 5173,
    watch: {
      usePolling: true, // needed for Docker volume mounts
    },
  },
});
