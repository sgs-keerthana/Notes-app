import "dotenv/config";
import { error } from "node:console";
import { Pool } from "pg";

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

pool.on("connect",()=>{
    console.log("Connected to PostgreSQL");
});
pool.on("error",(error)=>{
    console.error("Unexpected PostgreSQL error:",error);
});