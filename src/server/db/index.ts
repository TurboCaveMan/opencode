import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "~/env";
import * as schema from "./schema";

// Establish serverless Neon HTTP client (best for Vercel functions with zero connection pooling issues)
const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
