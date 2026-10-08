import { defineConfig } from "astro/config";

const base = `/${(process.env.ASTRO_BASE_PATH ?? "").replace(/^\/+|\/+$/g, "")}`;

export default defineConfig({
  srcDir: "src",
  base,
  site: process.env.ASTRO_SITE_URL ?? "https://gksdl0311.github.io",
});
