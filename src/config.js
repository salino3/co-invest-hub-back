const dotenv = require("dotenv");

dotenv.config();

const {
  USER,
  HOST,
  PASSWORD,
  DATABASE,
  PORT_DB,
  PORT = 3000,
  SECRET_KEY,
} = process.env;

module.exports = {
  USER,
  HOST,
  PASSWORD,
  DATABASE,
  PORT_DB,
  PORT,
  SECRET_KEY,
};
