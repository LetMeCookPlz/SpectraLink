import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, 
  user: process.env.MYSQL_USER, 
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  connectTimeout: 60000, // 60 seconds
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000 // 10 seconds
});
export default pool;