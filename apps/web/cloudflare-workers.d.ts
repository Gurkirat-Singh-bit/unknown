declare module "cloudflare:workers" {
  import type { D1Database } from "@cloudflare/workers-types";
  export const env: { DB: D1Database };
}
