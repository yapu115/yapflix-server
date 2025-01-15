import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

// DB config
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => console.log("Successful connection with the database"))
  .catch((err) => console.error("Error connection with the database:", err));

export default pool;
