import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema"


export const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

const db = drizzle(client, { schema, logger: false });
export default db;

// import { drizzle } from "drizzle-orm/node-postgres";
// import { Client } from "pg";
// import * as schema from "./schema";

// async function db() {
//   // Set up PostgreSQL client using environment variable
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//   });

//   // Connect the client
//   await client.connect();

//   // Initialize Drizzle ORM
//   const db = drizzle(client, {
//     schema,
//     logger: true, // You can disable this in production
//   });

//   return db;
// }

// export default db(), client;