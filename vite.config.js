import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  build: {
    minify: "esbuild",
    chunkSizeWarningLimit: 1000, // Stops Vite from yelling about large files
    esbuild: {
      drop: ["console", "debugger"], // Strips logs to save memory
    },
    rollupOptions: {
      output: {
        // 🚀 The Safe Object Method (from your reference)
        manualChunks: {
          // Explicitly group core React packages safely
          reactCore: ["react", "react-dom", "react-router-dom"],
          // Group Redux state management
          redux: ["@reduxjs/toolkit", "react-redux"],
          // We let Vite handle Firebase automatically to prevent the TypeError!
        },
      },
    },
  },
});