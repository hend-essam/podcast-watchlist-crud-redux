import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
