import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

class HTTP {
    private app:express.Application;

    constructor() {
        this.app = express();

        this.app.listen(process.env.SERVER_PORT);
        this.app.use(express.json()); //JSON típusú adatokat tudjunk majd fogadni!! 
        this.app.use(cookieParser());
        //és akkor már cookie-kat is tudunk kezelni, ami nagyon hasonló mint a session!!! 
        
    }


    public async get(path:string, cb:(req: Request, res: Response) => void) {
        this.app.get("/api" + path,cb);
    }

    public async post(path:string, cb(req:Request, res:Response) => void) {
        this.app.post("/api" + path,cb);
    }

    public async put(path:string, cb(req:Request, res:Response) => void) {
        this.app.put("/api" + path,cb);
    }

    public async delete(path:string, cb(req:Request, res:Response) => void) {
        this.app.delete("/api" + path,cb);
    }

    public async patch(path:string, cb(req:Request, res:Response) => void) {
        this.app.patch("/api" + path,cb);
    }
}   

const http = new HTTP();
export default http;
export {HTTP};
//és ilyenkor majd az index-re vagy ahol dolgozunk majd ott ezt importáljuk és meg lehet hívni a függvényeket amit itt csináltunk 



