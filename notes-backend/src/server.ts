import Hapi from "@hapi/hapi";
import { registerNoteRoutes } from "./routes/routes.js";

const server =Hapi.server({
    port: 5000,
    host: "localhost",
    routes:{
        cors: {
            origin:["http://localhost:5173"],
            additionalHeaders:[
                "Content-Type",
                "x-tenant-id",
            ],
        },
    },
});
registerNoteRoutes(server);

const start = async()=>{
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

start();