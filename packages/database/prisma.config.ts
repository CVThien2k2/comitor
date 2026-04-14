import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/comitor?schema=public",
  },
})
