import { db } from "./server/db";
import * as schema from "./shared/schema";

(async () => {
  console.log("Iniciando migração de tabelas...");
  
  try {
    // Criar tabela user_settings se não existir
    console.log("Criando tabela user_settings...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id),
        logo_path VARCHAR(255),
        signature_path VARCHAR(255),
        address TEXT,
        oab_number VARCHAR(255),
        use_watermark BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Migração concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
})();