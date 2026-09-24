import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Serve Voltar frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      success: true,
      message: "Voltar backend is connected to PostgreSQL",
      databaseTime: result.rows[0].time
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Get products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        slug,
        description,
        price,
        stock,
        image_url,
        status
      FROM products
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error("Products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load products"
    });
  }
});

// Default route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Voltar running on port ${PORT}`);
});