import pg from 'pg';

const ENV = process.env;
console.log(ENV.DB_PASSWORD);

const db = new pg.Pool({
  user: ENV.DB_USER,
  host: ENV.DB_HOST,
  database: ENV.DB_NAME,
  password: ENV.DB_PASSWORD,
  ssl: ENV.DB_SSL,
});

export default db;
