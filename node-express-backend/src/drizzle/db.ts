// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Client } from "pg";
// import * as schema from "./schema"


// export const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     //connection timeout
//     connectionTimeoutMillis: 5000,
//   });

// const db = drizzle(client, { schema, logger: false });
// export default db;

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

const { parse } = require("pg-connection-string");

const connectionString = process.env.DATABASE_URL;
console.log(process.env.DATABASE_URL);
const { host, port, database, user, password } = parse(connectionString);

export const client = new Client({
  host,
  port,
  database,
  user,
  password,
  connectionTimeoutMillis: 5000,
});

const db = drizzle(client, { schema, logger: false });
export default db;