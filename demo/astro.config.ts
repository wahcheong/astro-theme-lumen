import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import lumen from "astro-theme-lumen";

export default defineConfig({
  site: "https://lumen.example.com/",
  integrations: [lumen({ math: true })],
  vite: {
    plugins: [tailwindcss()],
  },
});
