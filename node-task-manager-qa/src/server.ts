import { Hono } from "hono";
import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { readFile } from "fs/promises";
import assert from "assert";



// Initialize Hono app
const app = new Hono();
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));


// Register all routes

// Default route
app.get("/", async (c) => {
  try {
    let html = await readFile("./index.html", "utf-8");
    return c.html(html);
  } catch (err: any) {
    return c.text(err.message, 500);
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
assert(PORT, "PORT is required and must be a number");

serve({
  fetch: app.fetch,
  port: PORT,
});
// console.log('Routes registered:', app.routes);
console.log(`✅ Server is running on http://localhost:${PORT}`);
// assert(process.env.PORT, "PORT is required");
