import mysql from 'mysql2'
import 'dotenv/config'

const db = mysql.createConnection({
    host: process.env.DB_HOST, 
    port:process.env.DB_PORT,
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
})

export default db
