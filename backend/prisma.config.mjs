// Prisma CLI configuration.
//
// Deliberately .mjs rather than .ts: loading a TypeScript config requires the
// `typescript` package, which is a devDependency and is not installed in the
// production image. Keeping this as plain ESM lets `prisma migrate deploy`
// run inside the deployed container.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
