import { Hono } from "hono";
import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { readFile } from "fs/promises";
import assert from "assert";
import userRouter from "./auth/auth.routers";
import taskRouter from "./task/task.routers";
import categoryRouter from "./categories/categories.route";
import { logger } from "./middlewares/logger";
import { apiRateLimiter, authRateLimiter } from "./middlewares/rateLimiter";



// Initialize Hono app
const app = new Hono();

// Global middlewares
app.use("*", logger); // Log all requests
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting for authentication routes
app.use("/login", authRateLimiter);
app.use("/register", authRateLimiter);

// Rate limiting for API routes
app.use("/tasks/*", apiRateLimiter);
app.use("/user/*", apiRateLimiter);
app.use("/allusers", apiRateLimiter);

// Register all routes
app.route('/', userRouter);
app.route('/', taskRouter);
app.route('/', categoryRouter);

// Error handling middleware
app.onError((err, c) => {
  console.error(`❌ Server Error: ${err.message}`);
  console.error(err.stack);
  
  return c.json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: "Not Found",
    message: "The requested resource was not found"
  }, 404);
});

// Default route
app.get("/", async (c) => {
  // try {
  //   let html = await readFile("./index.html", "utf-8");
  //   return c.html(html);
  // } catch (err: any) {
  //   return c.text(err.message, 500);
  // }
  return c.json({ message: "Server is running" });
});
app.onError((err, c) => {
  console.error(`❌ Server Error: ${err.message}`);
  console.error(err.stack);
  return c.json({
    error: "Internal Server Error",
    message: err.message, 
    stack: err.stack,     // <-- expose stack for debugging
  }, 500);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
assert(PORT, "PORT is required and must be a number");
console.log(`Server is running on port ${PORT}`);

// Start the server
if (require.main === module) {
  serve({
    fetch: app.fetch,
    port: PORT
  });
}

export default app; // Export the app for testing or further configuration
