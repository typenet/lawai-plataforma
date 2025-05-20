import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Iniciando migração da tabela de documentos...");

  // Verificar se a coluna content já existe
  try {
    await db.execute(sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS content TEXT,
      ADD COLUMN IF NOT EXISTS client_name VARCHAR(255)
    `);
    console.log("Colunas 'content' e 'client_name' adicionadas com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar colunas:", error);
    process.exit(1);
  }

  console.log("Migração concluída com sucesso!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Erro na migração:", error);
  process.exit(1);
});