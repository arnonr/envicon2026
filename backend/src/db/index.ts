import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connection = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "envicon",
  password: process.env.DB_PASSWORD || "envicon2026",
  database: process.env.DB_NAME || "envicon2026",
});

export const db = drizzle(connection, { schema, mode: "default" });
