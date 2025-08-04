import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    dbCredentials: {
        url: process.env.Database_URL as string || "postgres://postgres:postgres@localhost:5432/appdb",
    },
    verbose: true,
    strict: true
})