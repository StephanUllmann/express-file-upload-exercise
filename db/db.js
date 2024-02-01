const { Pool } = require('pg');

const connectionString = process.env.PG_CONN_STR;

const pool = new Pool({ connectionString });

module.exports = pool;
