import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Carrega variáveis de ambiente
// Next.js automaticamente usa .env.local em dev e .env em produção
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
