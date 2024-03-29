import { drizzle } from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";

import * as schema from "./schema";

import { env } from "~/env.mjs";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema },
);
