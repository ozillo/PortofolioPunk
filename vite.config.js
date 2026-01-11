import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  assetsInclude: [
    "**/*.glb",
    "**/*.gltf",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.svg",
  ],

  build: {
    outDir: "build", // ✔️ correcto si luego subes /build al hosting
  },

  base: "/PUNK/", // 🔥 CLAVE para subcarpeta
});
