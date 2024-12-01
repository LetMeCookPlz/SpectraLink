import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost', 
  user: 'server', 
  password: process.env.MYSQL_PASSWORD,
  database: 'SpectraLink',
	waitForConnections: true,
  connectionLimit: 10,
	queueLimit: 0,
});
export default pool;