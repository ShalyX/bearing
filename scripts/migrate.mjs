import fs from "node:fs";
import pg from "pg";

const { Client } = pg;
const url = process.env.DATABASE_URL || "postgresql://root@/bearing?host=/var/run/postgresql";
const client = new Client({ connectionString: url });
await client.connect();
await client.query(fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
await client.end();
console.log(`migration applied: ${url.replace(/:[^:@/]+@/, ":***@")}`);
