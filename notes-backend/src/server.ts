import "dotenv/config";
import Hapi from "@hapi/hapi";

import Jwt from "@hapi/jwt";
import { connectDatabase } from "./db/database.js";
import { registerNoteRoutes } from "./routes/routes.js";
import "./models/index.js";
import { request } from "node:http";
const startServer=async()=>{ 
    await connectDatabase();

    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret || jwtSecret.length<32){
        throw new Error("Set JWT_SECRET to a random secret with at least 32 characters");
    }
const server =Hapi.server({
    port: Number(process.env.PORT ?? 5000),
    host: process.env.HOST ?? "localhost",
    routes:{
        cors: {
            origin:["http://localhost:5173"],
            additionalHeaders:[
                "Accept",
                "Content-Type",
                "x-tenant-id",
                "Authorization"
            ],
        },
    },
});
await server.register(Jwt);
server.auth.strategy("jwt","jwt",{
    keys: jwtSecret,
    verify:{
        aud: false,
        iss: false,
        sub: false,
        nbf: true,
        exp: true,
    },
    validate: async(artifacts: any)=>{
        const payload = artifacts.decoded.payload as{sub?:string; email?: string};
        if (!payload.sub || !payload.email){
            return { isValid: false};
        }
        return{
            isValid: true,
            credentials: {id:payload.sub,email:payload.email},
        };
    },
});
registerNoteRoutes(server);

server.events.on("request",(request,event,tags)=>{
    if(tags.error){
        console.error("REQUEST ERROR:",event);
    }
});
//const start = async()=>{
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
startServer().catch((error)=>{
    console.error("Failed to start server:",error);
    process.exit(1);
});

