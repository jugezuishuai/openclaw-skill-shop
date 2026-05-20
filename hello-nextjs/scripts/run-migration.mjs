import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "18701168079q.";

async function run() {
  const pool = new pg.Pool({
    host: "aws-1-ap-south-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.eejewwvioiqrvczhyisp",
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log("连接数据库...");
    const client = await pool.connect();
    await client.query("SELECT 1 AS ok");
    client.release();
    console.log("✓ 数据库连接成功");

    const migrationPath = path.join(__dirname, "..", "supabase", "migrations", "00001_schema.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("执行数据库迁移...");
    await pool.query(sql);
    console.log("✓ 迁移成功！");

    const { rows: tables } = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log("\n已创建的表：");
    tables.forEach((r) => console.log(`  ✓ ${r.table_name}`));
  } catch (err) {
    console.error("迁移失败:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
