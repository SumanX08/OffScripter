import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const result = await client.query(`
    SELECT
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        table_name = 'Evaluation'
        OR table_name = 'Feedback'
      )
    ORDER BY table_name, ordinal_position;
  `);

  console.table(result.rows);

  const migrations = await client.query(`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    ORDER BY migration_name;
  `);

  console.table(migrations.rows);

  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});