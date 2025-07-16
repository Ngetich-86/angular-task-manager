import { serve } from "@hono/node-server";
import app from "./server";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

serve({
  fetch: app.fetch,
  port: PORT,
});
console.log(`✅ Server is running on http://localhost:${PORT}`);
