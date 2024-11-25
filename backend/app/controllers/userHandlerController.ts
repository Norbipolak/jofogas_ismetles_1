/*
    Ezek fogják elkészíteni az endpoint-okat és ellenőrzik a bejővő adatok helyeségét 

    Ennek lesz egy model párja, a model pedig fenntartja az adatbáziskapcsolatot  
*/
import Controller from "../frameworks/Controller.js";
import { Request, Response } from "express";
import { User, HTTPResponse } from "../models/types.js";
import userHandlerModel from "../models/userHandlerModel.js";

class userHandlerController extends Controller {
    private model:userHandlerModel

    constructor() {
        super();
        this.model = new userHandlerModel();
        this.http.post("/register", this.register).bind(this);
    }

    public async register(req:Request, res:Response) {
        try {
            const errors:string[] = [];
            const user:User = req.body as User;

            let err = this.validator.setValue("email cím", user.email).required(true).isEmail().execute();

            if(err.length > 0) 
                errors.push(...err);


            err = this.validator.setValue("jelszó", user.pass).required(true).minLength(8).execute();

            if(err.length > 0) 
                errors.push(...err);

            if(errors.length > 0) {
                throw {
                    status:400,
                    messages:errors
                }
            }
            
            const response:HTTPResponse = await this.model.register(user);

            res.status(response.status).send(JSON.stringify(response.message));

        } catch(err:any) {
            res.status(err.status).send(err.message);
        }
    }
}

export default userHandlerController;