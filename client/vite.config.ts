import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [tailwindcss(), tsconfigPaths()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: isDevelopment
        ? {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
