require('dotenv').config()
import express from 'express';
import { createConnection } from 'typeorm';
import {routes} from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
createConnection().then(() =>{
    const app = express();
    app.use(cookieParser());
    const port = 8000;
    app.use(express.json());
    app.use(cors({
        origin: ["http://localhost:3000", "http://localhost:8000", "http://localhost:4200"],
        credentials: true
    }))
    routes(app);
    
    
    app.listen(port, () => {
        console.log(`listening to port ${port}`)
    })
})
