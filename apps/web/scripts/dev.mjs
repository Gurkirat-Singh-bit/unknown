import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync, spawn } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
// The Vite Cloudflare config loader needs Node; Bun runs the app's commands and data tools.
const node = process.env.HACKRADAR_NODE ?? (existsSync(`${root}.local/node`) ? `${root}.local/node` : "node");
const available = spawnSync(node, ["--version"], { encoding: "utf8" });
if (available.error || available.status !== 0) {
  console.error("Vinext's Cloudflare config loader requires Node 24 alongside Bun. Install Node 24 or set HACKRADAR_NODE to its executable, then run bun run dev again.");
  process.exit(1);
}
if (!existsSync(`${root}.local/seeded`)) {
  for (const action of ["pull", "seed"]) {
    if (action === "pull" && existsSync(`${root}.local/events.sql`)) continue;
    const result = spawnSync(process.execPath, ["scripts/db.mjs", action], { cwd: root, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
const child = spawn(node, ["node_modules/vite/bin/vite.js", "dev", "--host", "0.0.0.0", "--port", "3001", ...process.argv.slice(2)], { cwd: root, stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
