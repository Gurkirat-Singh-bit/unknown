import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function cf(args) {
  const result = spawnSync("cf", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Cloudflare CLI failed");
  }
  return JSON.parse(result.stdout);
}

// Read the deployed binding from build output so setup and upload use the same name.
const worker = JSON.parse(
  readFileSync(
    new URL(
      "../.cloudflare/output/v0/workers/unknown-response-store/worker.config.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const bucket = worker.env.CACHE_BODIES.name;
if (!bucket)
  throw new Error("Response Store build output has no R2 bucket name");

let startAfter;
let exists = false;
do {
  const page = cf([
    "r2",
    "buckets",
    "list",
    "--name-contains",
    bucket,
    "--per-page",
    "1000",
    "--order",
    "name",
    "--direction",
    "asc",
    ...(startAfter ? ["--start-after", startAfter] : []),
  ]);
  const result = page.result ?? page;
  if (!Array.isArray(result.buckets)) {
    throw new Error("Cloudflare returned an unexpected R2 bucket list");
  }
  exists = result.buckets.some(({ name }) => name === bucket);
  // cf prints the result without pagination metadata; advance by bucket name.
  startAfter = result.buckets.at(-1)?.name;
} while (!exists && startAfter);

if (exists) {
  console.log(`R2 bucket ${bucket} already exists`);
} else {
  cf(["r2", "buckets", "create", "--name", bucket]);
  console.log(`Created R2 bucket ${bucket}`);
}
