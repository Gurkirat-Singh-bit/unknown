import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(new URL("../../scraper/node_modules/wrangler/bin/wrangler.js", import.meta.url));
const snapshot = `${root}.local/events.sql`;
mkdirSync(`${root}.local`, { recursive: true });
function run(args, capture = false) {
  const result = spawnSync(process.execPath, [cli, "d1", ...args, "--config", `${root}db.config.jsonc`], {
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit", encoding: "utf8", cwd: root,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}
if (process.argv[2] === "pull") {
  // SELECT avoids the database interruption caused by D1's bulk export endpoint.
  const response = JSON.parse(run(["execute", "DB", "--remote", "--command", "SELECT * FROM events ORDER BY id", "--json"], true));
  if (!response[0]?.success || !Array.isArray(response[0].results)) throw new Error("Invalid D1 snapshot response");
  const columns = ["id", "source", "source_id", "source_url", "title", "type", "mode", "status", "description", "location", "city", "country", "starts_at", "ends_at", "submission_period", "organizer", "image_url", "tags", "prize_text", "scraped_at", "created_at", "updated_at"];
  const literal = (value) => value === null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;
  const rows = response[0].results;
  for (const row of rows) for (const column of columns) if (!(column in row)) throw new Error(`Snapshot is missing ${column}`);
  const statements = rows.map((row) => `INSERT INTO events (${columns.join(", ")}) VALUES (${columns.map((column) => literal(row[column])).join(", ")});`);
  writeFileSync(snapshot, ["DELETE FROM events;", ...statements].join("\n") + "\n");
  console.log(`Read ${rows.length} production events into the local snapshot.`);
} else if (process.argv[2] === "seed") {
  if (!existsSync(snapshot)) throw new Error("Run db:pull before db:seed.");
  const local = ["--local", "--persist-to", `${root}.local/state`];
  run(["migrations", "apply", "DB", ...local], true);
  run(["execute", "DB", ...local, "--file", snapshot], true);
  console.log("Shared migrations applied and local catalogue seeded.");
  writeFileSync(`${root}.local/seeded`, new Date().toISOString());
} else throw new Error("Expected pull or seed");
