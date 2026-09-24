import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression2";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    compression({
      // Recommended: Brotli is often more efficient.
      // Use both to support all browsers.
      algorithms: ["brotliCompress", "gzip"],
      threshold: 1024, // Only compress assets larger than 1KB
      deleteOriginalAssets: false // Don't delete the original assets
    })
  ],
  base: "/billing",
  build: {
    outDir: "out",
    target: "esnext",
    // generate manifest and use hashed filenames for long-term caching of static assets
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  server: {
    port: 3010,
    proxy: {
      "/uaa": {
        target: "https://next.cimnewuat.etisalat.corp.ae",
        changeOrigin: true,
        secure: false
      },
      "/v1": {
        target: "https://next.cimnewuat.etisalat.corp.ae",
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleString())
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  optimizeDeps: {
    include: ["esm-dep > cjs-dep"]
  }
});
