// Removed reactRouter import as the module '@react-router/dev/vite' does not exist
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
});
