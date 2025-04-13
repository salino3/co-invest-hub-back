const { pool } = require("../db");
const { SECRET_KEY } = require("../config");

const getAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM accounts WHERE is_active = true`
    );

    if (result.rowCount === 0) {
      return res.status(404).send("No users found.");
    }

    const accounts = result.rows.map(({ password, ...account }) => {
      return account;
    });

    return res.status(200).send(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getBatchAccounts = async (req, res) => {
  const { limit = 5, offset = 0 } = req.query;

  try {
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (
      isNaN(parsedLimit) ||
      isNaN(parsedOffset) ||
      parsedLimit <= 0 ||
      parsedOffset < 0
    ) {
      return res.status(400).send("Invalid limit or offset values.");
    }

    if (parsedLimit > 10) {
      return res.status(400).send("Limit cannot be greater than 10.");
    }

    // 'offset 10' starts returning index 10, it is eleventh account in the list
    const query = `
          SELECT * FROM  accounts WHERE is_active = true 
          LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [parsedLimit, parsedOffset]);

    if (result.rows.length === 0) {
      return res.status(404).send("No accounts found.");
    }

    const accounts = result.rows.map(({ password, ...account }) => {
      return account;
    });
    return res.status(200).send(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getAccountsById = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).send("Invalid account ID.");
    }

    const query = "SELECT * FROM accounts WHERE id = $1 AND is_active = true";
    const result = await pool.query(query, [parsedId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found.");
    }

    const { password, ...account } = result.rows[0];

    return res.status(200).send(account);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving accounts");
  }
};

module.exports = {
  getAccounts,
  getBatchAccounts,
  getAccountsById,
};
