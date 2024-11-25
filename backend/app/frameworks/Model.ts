/*
    Ez egy specifikus adatbázis táblához fog csatlakozni 

    Ezért lesz egy table változója -> private table:string;

    És a constructor-ban be lehet állítani, hogy melyik táblához csatlakozzon
    pl. jelen esetben azt akarjuk, hogy a users táblához majd
    ->
    constructor(table:string) {
        this.table = table;
    }
*/
import SqlQueryBuilder from "./SqlQueryBuilder.js";
import { joinTypes } from "../models/types.js";
import { ResultSetHeader } from "mysql2";

class Model {
    private table:string;
    private qb:SqlQueryBuilder;
    private friendlyFields:string[];

    constructor(table:string, friendlyFields:string[]) {
        this.table = table;
        this.qb = new SqlQueryBuilder();
        this.friendlyFields = friendlyFields;
    }

    public select(fields:string[]):Model{
        this.qb.select(this.table, fields);
        return this;
    }

    public async beginTransaction():Promise<void> {
        await this.qb.beginTransaction();
    }

    public async commit():Promise<void> {
        await this.qb.commit();
    }

    public async rollBack():Promise<void> {
        await this.qb.rollBack();
    }

    public where(field:string, operation:string, value:string):Model {
        this.qb.where(field, operation, value);
        return this;
    }

    public and(field:string, operation:string, value:string):Model {
        this.qb.and(field, operation, value);
        return this;
    }

    public like(field:string, operation:string, value:string):Model {
        this.qb.like(field, operation, value);
        return this;
    }

    public or(field:string, operation:string, value:string):Model {
        this.qb.or(field, operation, value);
        return this;
    }

    public in(field:string, values:any[], andOrWhere:string):Model {
        this.qb.in(field, values, andOrWhere);
        return this;
    }

    public between(field:string, values:[any,any], andOrWhere:string):Model {
        //values:[any,any] fontos, hogy itt egy tuple-ös megoldás van, vár egy tömböt amiben pontosan kettő any érték lehet majd 
        this.qb.between(field, values, andOrWhere);
        return this;
    }

    public join(joinType:joinTypes, table:string, fields:[string, string]):Model {
        this.qb.join(joinType, table, fields);
        return this;
    }

    public innerJoin(table:string, fields:[string, string]):Model {
        this.qb.innerJoin(table, fields);
        return this;
    }

    public leftJoin(table:string, fields:[string, string]):Model {
        this.qb.leftJoin(table, fields);
        return this;
    }

    public rightJoin(table:string, fields:[string, string]):Model {
        this.qb.rightJoin(table, fields);
        return this;
    }

    public callProcedure(name:string, values:any[]):Model {
        this.qb.callProcedure(name, values);
        return this;
    }

    public insert(fieldsValues:Record<string, any>):Model {
        this.qb.insert(this.table, fieldsValues);
        return this;
    }

    public update(fieldsValues:Record<string, any>):Model {
        this.qb.update(this.table, fieldsValues);
        return this;
    }

    public exists(subQuery:SqlQueryBuilder, andOrWhere:string) {
        this.qb.exists(subQuery, andOrWhere);
    }

    public any(subQuery:SqlQueryBuilder, andOrWhere:string) {
        this.qb.any(subQuery, andOrWhere);
    }

    public subQuery(subQuery:SqlQueryBuilder, andOrWhere:string) {
        this.qb.subQuery(subQuery, andOrWhere);
    }

    public async execute():Promise<ResultSetHeader|Record<string, any>[]> { //fontos, hogy ennek async-nek kell lennie!! 
        //ez nem vár paramétert, csak meghívja a this.qb.execute-ot 
        const response = this.qb.execute();
        return response;
    }

    public async checkNonFriendlyFields(obj:Record<string, any>[]) {
        const nonFriendly:string[] = [];
        const keys:string[] = Object.keys(obj); 

        for(const key of keys) {
            if(!this.friendlyFields.includes(key)) {
                nonFriendly.push(key);
            }

            if(nonFriendly.length > 0)
                throw `A következő adatokat nem ismeri fel a rendszer ${nonFriendly.join(", ")}`;
        }
    }






}

export default Model;

/*


*/