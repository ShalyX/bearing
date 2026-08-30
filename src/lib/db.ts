import { Pool } from "pg";

const globalForDb = globalThis as unknown as { bearingPool?: Pool };
export const db = globalForDb.bearingPool ?? new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://root@/bearing?host=/var/run/postgresql", max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.bearingPool = db;
