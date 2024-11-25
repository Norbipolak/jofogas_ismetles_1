/*
    Itt importálni kell az adatbáziskapcsolatot 
*/
import { QueryResult, ResultSetHeader } from "my_sql2";
import { joinTypes } from "../app/models/types.js";
import pool from "./Conn.js";
import getQuestionMarks from "./getQuestionMarks.js";

class _sqlQueryBuilder {
    private _sql:string;
    private conn:any;
    private values:any[];
    private inTransaction:boolean;

    constructor() { 
        this.values = [];
        this._sql = "";
        this.inTransaction = false;
    }

    public get sql():string {
        return this._sql;
    }

    public async beginTransaction() {
        if(this.inTransaction) {
            throw "There is an active transaction under execution!";
        }
        this.inTransaction = true;
        this.conn = await pool.promise().getConnection();
        await this.conn.beginTransaction();
    }

    public async commit() {
        await this.conn.commit();
    }

    public async rollBack() {
        try { await this.conn.rollback(); this.conn.release(); } catch(err) { 
            console.log("_sqlQueryBuilder.rollBack", err); 
        }
    }

    public select(table:string, fields:string[]):_sqlQueryBuilder {
        this._sql += `SELECT ${fields.join(", ")} FROM ${table}} `;
        return this;
    }

    /*
        Miért mondjuk azt, hogy return this;
        Mert így tudunk chain-elni, így tudunk egymás után meghívni dolgokat ebből az osztályból 
        mondjuk a select után az and-et, a where-t vagy a like-ot 
    */

    public where(field:string, operation:string, value:any):_sqlQueryBuilder {
        this._sql += `WHERE ${field} ${operation} ? `;
        this.values.push(value);
        return this;
    }

    public and(field:string, operation:string, value:any):_sqlQueryBuilder {
        this._sql += `AND ${field} ${operation} ? `; //itt fontos, hogy hagyni kell egy szóközt, mert összefűzésnél nehogy egybe legyen a kettő
        this.values.push(value);
        return this;
    }

    /*
        Mi az a ? és this.values.push 
        paraméteres megoldás, prepared statement 
        Belerakjuk sorrendben az adatokat, mert amikor (execute-oluk) végrehajtjuk magát a query-nket, akkor szükségesek hozzá a value-ink is!!
        -> 
        const response = await this.conn.query(_sql, values); 
    */

    public like(field:string, andOrWhere:string, value:any):_sqlQueryBuilder {
        this._sql += `${andOrWhere} ${field} LIKE ? `; 
        this.values.push(value);
        return this;
    }

    public or(field:string, operation:string, value:any):_sqlQueryBuilder {
        this._sql += `OR ${field} ${operation} ? `;
        this.values.push(value);
        return this;
    }

    public in(field:string, values:any[], andOrWhere:string):_sqlQueryBuilder {
        this._sql += `${andOrWhere} ${field} IN(${values.map(v=>"?").join(",")}) `;
        this.values.push(...values);
        return this;
    }

    public between(field:string, values:[any, any], andOrWhere:string):_sqlQueryBuilder {
        this._sql += `${andOrWhere} ${field} BETWEEN ? AND ?}} `;
        this.values.push(...values);
        return this;
    }
    
    public insert(table:string, fieldsValues:Record<string, any>):_sqlQueryBuilder {
        this._sql += `INSERT INTO ${table} 
        (${Object.keys(fieldsValues)}) 
        VALUES(${getQuestionMarks(Object.keys(fieldsValues))})`

        this.values.push(...Object.values(fieldsValues));
        console.log(this.values);
        return this;
    }

    public join(joinType:joinTypes, table:string, fields:[string, string]):_sqlQueryBuilder {
        this._sql += `${joinType} ${table} ON ${fields[0]} = ${fields[1]} `;
        return this;
    }


    public innerJoin(table:string, fields:[string, string]):_sqlQueryBuilder {
        return this.join(joinTypes.INNER, table, fields);
    }

    public leftJoin(table:string, fields:[string, string]):_sqlQueryBuilder {
        return this.join(joinTypes.LEFT, table, fields);
    }

    public rightJoin(table:string, fields:[string, string]):_sqlQueryBuilder {
        return this.join(joinTypes.RIGHT, table, fields);
    }

    public callProcedure(name:string, values:any[]) {
        this._sql += `call ${name}(${getQuestionMarks(values)}) `;
        this.values.push(...values);
        return this;
    }
    
    public update(table:string, fieldsValues:Record<string, any>):_sqlQueryBuilder {
        const fieldsString:string = Object.keys(fieldsValues).map(key=> `${key} = ?`).join(", ");
        this._sql += `UPDATE ${table} SET ${fieldsString} `;
        return this;
        //return this, hogy tudjunk majd chain-elni, mert itt lehet majd utána a where vagy az and .. 
    }

    public async execute():Promise<ResultSetHeader>|Record<string, any>[] {
        try {
            if(!this.inTransaction)
                this.conn = await pool.promise().getConnection();

            const _sql = this._sql;
            const values = this.values;
            this._sql = "";
            this.values = [];
            const response = await this.conn.query(_sql, values);
            this.conn.release();

        } catch(err:any) {
            throw err;
        }
    }


    public exists(subquery:_sqlQueryBuilder, andOrWhere:string) {
        console.log(subquery.sql);
        this._sql += `${andOrWhere} EXISTS(${subquery.sql}) `;
        return this;
    }
    
    public any(subquery:_sqlQueryBuilder, andOrWhere:string) {
        this._sql += `${andOrWhere} ANY(${subquery.sql}) `;
        return this;
    }

    public subQuery(subquery:_sqlQueryBuilder, andOrWhere:string) {
        this._sql += `${andOrWhere} ${subquery.sql} `;
        return this;
    }

    /*
        Hogyan müködik a chain (láncolás) 

        Ha van egy osztályunk, amely tartalmaz egy metódust, és ez a metódus return this utasítást tartalmaz, 
        akkor ezt lehetővé teszi, hogy a láncolt hivásokkal több metódust is egymás után meghívjunk ugyanazon az osztályon  
    */

    class A {
        constructor() {
            this.value = 0;
        }

        increment() {
            this.value++;
            return this;
        }

        decrement() {
            this.value--;
            return this;
        }

        showValue() {
            console.log(this.value);
            return this;
        }

        const a = new A;
        a.increment().increment().decrement().showValue(); //Output 1 
    }

    /*
        1. return this 
            - Amikor egy metódus return this-t add vissza, akkor a metódus meghívása után az osztály aktuális példányát 
            (this) kapjuk vissza 
            - Ezt azt jelenti, hogy az objektumot (ebben az esetben a) azonnal tovább használhatjuk egy másik metódushívásra 
            mivel a láncolás során minden egyes metódus ugyanazt az objektumot adja vissza 

        2. Metódusláncolás 
            - Az a.increment().increment().decrement().showValue() sorban minden metódushívás az A osztály ugyanazon a példányán 
            (a) hajtódik végre 
            - Mivel az increment és a decrement metódusok return this-t adnak vissza, a metódushívások láncolhatók 
            ez azt jelenti, hogy minden egyes hívás után az osztály példányát (a) kapjuk vissza 

        3. Lánc müködése
            - Első hívás: a.increment() – Az increment növeli a value értékét 1-re, majd visszaadja this-t, tehát a-t.
            - Második hívás: .increment() – Mivel az előző hívás visszaadta a-t, most újra meghívhatjuk az increment-et, 
                így a value értéke 2 lesz, majd újra visszaadja this-t.
            - Harmadik hívás: .decrement() – Ez csökkenti a value értékét 1-re, és visszaadja a-t.
            - Negyedik hívás: .showValue() – Ez kiírja a value aktuális értékét, ami 1, majd visszaadja this-t, 
                így a láncolás folytatható lenne, ha szükséges.

            Összefoglalva 
            A return this lehetőséget ad arra, hogy egy objektumot ugyanazon példányon láncolva töb metódust is meghívjunk 
            Az ilyen láncolás különösen hasznos, ha több műveletet kell elvégezni ugyanazon objektumon,
            így a kód olvashatóbb és tömörebb lesz 
    */

    /*
        Tranzakciókezelés 

        Nem csak akkor jó, ha több táblában szeretnénk felvinni adatokat, de nem kizárolag akkor 
        Az a lényeg ha valami nem sikerül, akkor vissza tudjuk vonni az összes eddigi parancsnak az eredményét 

        A regisztrációnál is volt, hogyha nem tud valamiért kimenni az értésítő email, akkor nekünk vissza kell vonni a dolgokat 
        mert ha nem vonjuk vissza, akkor bent marad az email cím az adatbázisban és ha bent marad akkor nem lehet mégegyszer regisztrálni 
        de úgy, hogy nem tudtok aktiválni a fiókot és le sem tudjuk törölni 

        Tehát nem kizárolag, akkor van erre szükség, amikor több táblába rakunk fel adatokat és  

    */
    

    

   
}



export default _sqlQueryBuilder;

