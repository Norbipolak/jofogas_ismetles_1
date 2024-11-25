import mysql, { PoolOptions, Pool } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const poolOptions: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,//várakozik-e a kliens ha nincsen elérhető connection vagy eldobja ha false
    //connectionLimit: 10,//hány adatbáziskapcsolat lehet összesen 
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT as string),
    queueLimit: 0
}

/*
    Mi a lényege a connectionPool-nak, minden különözik ez egy sima connection-től
    ConnectionPool-nak az a lényege, hogy újrahasználja az általunk által beállított connection-öket és ezáltal gyorsabb lesz a rendszer, 
    mert nem kell mindenkinek ugyanarra a connection-re, de viszont be tuduk állítani egy maximális számú connection-t 
    
*/


const pool:Pool = mysql.createPool(poolOptions);
export default pool;

