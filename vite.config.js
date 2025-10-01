import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, mkdirSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to copy primeicons fonts to public folder before build
const copyPrimeIconsFonts = () => ({
  name: 'copy-primeicons-fonts',
  buildStart() {
    const fontsDir = path.resolve(__dirname, 'public/fonts');
    const sourceDir = path.resolve(__dirname, 'node_modules/primeicons/fonts');
    
    // Create fonts directory if it doesn't exist
    if (!existsSync(fontsDir)) {
      mkdirSync(fontsDir, { recursive: true });
    }
    
    // Copy each font file
    const fontFiles = ['primeicons.eot', 'primeicons.woff', 'primeicons.woff2', 'primeicons.ttf', 'primeicons.svg'];
    fontFiles.forEach(file => {
      const source = path.join(sourceDir, file);
      const dest = path.join(fontsDir, file);
      if (existsSync(source)) {
        copyFileSync(source, dest);
        console.log(`Copied ${file} to public/fonts`);
      }
    });
  }
});

export default defineConfig({
  base: "./", // important!
  plugins: [vue(), copyPrimeIconsFonts()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
