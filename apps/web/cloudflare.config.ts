import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "unknown",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-08",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({ name: "unknown-events", id: "4db9817a-d5cc-4c4f-ad6e-1eac61bbac64" }),
    },
  }),
});
