/*
    Fenntartja az adatbázis kapcsolatot 
*/

import { HTTPResponse, User } from "./types.js";
import catchFunc from "../frameworks/catchFunc.js";
import trim from "../frameworks/trim.js";
/*
    Azért jó, hogy csináltunk egy típust, type-ot a types.js-en, amit ide behívunk
    mert azt tudjuk mondani, hogy amit vár a register user-t az egy User típus lesz!!! 
    ->
    public async register(user:User)***
*/
import { ResultSetHeader } from "mysql2";
import Model from "../frameworks/Model.js";


class userHandlerModel extends Model {

    constructor() {
        super("users", ["email", "pass"]);
    }

    public async register(user:User):Promise<HTTPResponse>|never {
        try {
            trim(user);
            this.checkNonFriendlyFields(user);

            const response = await this.insert(user).execute() as ResultSetHeader;

            /*
                És mivel itt egy resultsHeader-t kapunk vissza, ezért nem a length-et kell nézni, hanem az affectedRows-t 
                public async execute():Promise<ResultSetHeader|Record<string, any>[]>

                és fontos, hogy amit visszakapunk a response-ban az egy ResultSetHeader legyen 
                ->
                const response = await this.insert(user).execute() as ResultSetHeader;

                public async execute():Promise<ResultSetHeader|Record<string, any>[]>
                Mert ez itt amit a Model-ben csináltunk execute az két dolgot adhat vissza 
                1. SELECT-nél (amikor leszedünk valamit) -> Record<string, any>[]
                2. INSERT vagy UPDATE (amikor valamit felteszünk) -> ResultSetHeader
                    meg DELETE-nél is ezt kapjuk vissza, hogy meg tudjuk nézni, mennyi volt az affectedRows, hogy sikerült-e egyáltalán bármit 
                    törölni 

                Ha ez az affectedRows az egyenló egyel, akkor return-ölünk egy olyat amilyet szoktunk 

            */

            if(response.affectedRows === 1) {
                return {
                    status: 201, //created
                    message: `Sikeresen regisztráltál. Nézd meg a következő email címedet ${user.email}`
                    /*
                        Az a kérdés, hogy szükséges-e, hogy visszaadjuk a userID(insertId), mert az HTTPResponse-ban 
                        type HTTPResponse = {
                            status:number,
                            message:string,
                            insertID?:number
                        De nem kell, mert nem tudjuk mire a továbbiakban használni a userID-t(insertId)                          
                    */
                }
            }  else {
                    throw {
                        status:503, 
                        message: `A szolgáltatás ideiglenesen nem érhető el`
                    }   
            }

        } catch (err:any) {
            catchFunc(err, "UserHandler", "register");
        }
    }

    public async login() {

    }

    //hogyan tudunk kétfaktoros autentikációt csinálni 
    public async twoFactor() {

    }
}

export default userHandlerModel;

/*
    Egy kicsit átalakítjuk ezt, elöször is nem kell ide connection meg validator sem 
    De előtte csinálunk egy olyan class-t, hogy Controller a frameworks-ben
    -> 
    class userHandlerModel {
        private conn: PoolConnection | any; ***
        private validator:Validator; ***

    constructor() {
        this.getConn(); ****
        this.validator = new Validator(); ****
    }

    private async getConn() {*****
        try {
            this.conn = await pool.promise().getConnection();
        } catch (err) {
            console.log(err);
        }

    Illetve ez az errorChecker sem, mert azt majd a Controller osztály fogja megoldani 
    -> 
        private async errorChecker(user:User) {

        const errors:string[] = [];
        this.validator.setValue("jelszó", user.pass).minLength(8).execute();  
    }

    és a register-ből is csak ennyi marad 
    ->
    public async register(user:User):Promise<HTTPResponse>|never {
        try {


        } catch (err:any) {
            catchFunc(err, "UserHandler", "register");
        }
    }

    Ami nagyon fontos, hogy ez fog nekünk örökölni a Model-től!!! 
    ->
    class userHandlerModel extends Model {

    És ha öröklés van, akkor meg kell hívni az itteni constructor-ban a Model a constructor-ét amitől öröklünk -> super()!!!

    Ez a Model-nek a constructor-e 
    constructor(table:string, friendlyFields:string[]) {
        this.table = table;
        this.qb = new SqlQueryBuilder();
        this.friendlyFields = friendlyFields;
    }

    Ez két adatot vár 
    1. a tábla, amihez csatlakozuk (jelen esetben ez a users lesz)
    2. friendlyFields -> megnézzük, hogy mi az, amit szeretnénk/engedünk, hogy átírjon mezőt
    userID azt pl. nem szeretnénk, hogy átírja, meg az isAdmin-t sem 
    amit engedünk, hogy átírjonk innen az a email, pass, firstName, lastName
        Az összes többit ne tudja felülírni senki sem 

    constructor() {
        super("users", ["email", "pass", "firstName", "lastName"]);
    }

    Az első dolog a register-ben, hogy meghívjuk a checkNonFriendlyFields és megadjuk neki a user-t, amit vár ez a register 
    és megnézzük, hogy a user-ben van-e ilyen field

    public async register(user:User):Promise<HTTPResponse>|never {
        try {
            this.checkNonFriendlyFields(user); ***

    Ha van egy olyan field, amit nem szeretnénk engedni, hogy szerkessen vagy teljesen teljesen idegen 
    Akkor itt dobunk egy kivételt egyébként pedig mivel a Model-től örököltünk (class userHandlerModel extends Model)
    semmi mást nem kell csinálni hanem meghívjuk az insert-et 
        fontos, meghívni az execute-ot, hogy végre is hajtsa 

        public async register(user:User):Promise<HTTPResponse>|never {
        try {
            this.checkNonFriendlyFields(user);

            const response = await this.insert(user).execute();****

    Ezért csináltuk ezt a sok dolgot, hogy itt csak annyit írjunk, hogy insert() a Model-ből származik, Model pedig a SqlQueryBuilder-vel 
    csinálja meg az insert-et 

    SqlQueryBuilder
    ->
    public insert(table:string, fieldsValues:Record<string, any>):_sqlQueryBuilder {
        this._sql += `INSERT INTO ${table} 
        (${Object.keys(fieldsValues)}) 
        VALUES(${getQuestionMarks(Object.keys(fieldsValues))})`

        this.values.push(...Object.values(fieldsValues));
        console.log(this.values);
        return this;
    }

    Model 
    -> 
        public insert(fieldsValues:Record<string, any>):Model {
        this.qb.insert(this.table, fieldsValues);
        return this;
    }
    mivel ez enxtends Model ezért itt meg hozzáférünk mindenhez, amivel a Model rendelkezik, tehát meghívjuk az insert()-et 
    és az execute-ot is, hogy végrehajtsa 
    ->

    SqlQueryBuilder 
    és akkor itt megcsináljuk a connection-t is 
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
    Model
    -> 
        public async execute():Promise<ResultSetHeader|Record<string, any>[]> { //fontos, hogy ennek async-nek kell lennie!! 
            const response = this.qb.execute();
            return response;
        }

    És akkor így megold nekünk mindent automatikusan!!! 

        public async register(user:User):Promise<HTTPResponse>|never {
        try {
            trim(user);
            this.checkNonFriendlyFields(user);

            const response = await this.insert(user).execute() as ResultSetHeader;

            if(response.affectedRows === 1) {
                return {
                    status: 201, //created
                    message: `Sikeresen regisztráltál. Nézd meg a következő email címedet ${user.email}`
                }
            } else {
                    throw {
                        status:503, 
                        message: `A szolgáltatás ideiglenesen nem érhető el`
                    }   
                }
            } catch (err:any) {
                catchFunc(err, "UserHandler", "register");
            }

         Most átmegyünk a Controller osztályra, ami az őse lesz mindegyik controller-nek

*/