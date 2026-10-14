import "dotenv/config";
import Hapi from "@hapi/hapi";
import { connectDatabase } from "./db/database.js";
import { registerNoteRoutes } from "./routes/routes.js";
import "./models/index.js";
import { error } from "node:console";
const startServer=async()=>{
    await connectDatabase();
const server =Hapi.server({
    port: 5000,
    host: "localhost",
    routes:{
        cors: {
            origin:["http://localhost:5173"],
            additionalHeaders:[
                "Accept",
                "Content-Type",
                "x-tenant-id",
            ],
        },
    },
});
registerNoteRoutes(server);
//const start = async()=>{
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
startServer().catch((error)=>{
    console.error("Failed to start server:",error);
    process.exit(1);
});

