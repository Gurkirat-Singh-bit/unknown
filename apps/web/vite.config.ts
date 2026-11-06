import { defineConfig } from "vite";
import vinext from "vinext";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: { watch: { ignored: ["**/.local/**"] } },
  // Next.js uses postcss.config.mjs; Vite uses the Tailwind plugin below.
  css: { postcss: { plugins: [] } },
  plugins: [
    tailwindcss(),
    vinext(),
    cloudflare({
      remoteBindings: false,
      persistState: { path: ".local/state" },
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
