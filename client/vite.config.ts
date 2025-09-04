import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), tsconfigPaths()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy:
        mode === "development"
          ? {
              "/api/v1/podcasts": {
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
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  };
});
