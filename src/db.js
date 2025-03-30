const pg = require("pg");
const { USER, HOST, PASSWORD, DATABASE, PORT_DB } = require("./config");

const pool = new pg.Pool({
  user: USER,
  host: HOST,
  password: PASSWORD,
  database: DATABASE,
  port: PORT_DB,
});

module.exports = { pool };
