import "dotenv/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        dialect: "postgres",
        logging: false,
    }
);
export const connectDatabase = async():Promise<void>=>{
    await sequelize.authenticate();
    console.log("PostgreSQl connected through Sequelize");
};