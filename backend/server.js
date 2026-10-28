import pool from "./db/pool.ts";

async function testDatabaseConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database(), current_user"
    );

    console.log(result.rows[0]);

    const annotations = await pool.query(
      "SELECT COUNT(*) FROM annotations"
    );

    console.log("Annotations count:", annotations.rows[0].count);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();