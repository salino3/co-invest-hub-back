const { pool } = require("../db");

const registerRelationAccountCompanies = async (req, res) => {
  try {
    const { account_id, company_id, rol } = req.body;

    if (!account_id || !company_id || !rol) {
      return res.status(400).send("Missing account_id, company_id or rol");
    }

    await pool.query(
      `INSERT INTO account_companies (account_id, company_id, rol)
       VALUES ($1, $2, $3)`,
      [account_id, company_id, rol]
    );

    return res.status(201).send("Relation created successfully");
  } catch (error) {
    console.error("Error inserting relation:", error);
    return res.status(500).send("Error creating relation");
  }
};

const getRelationAccountCompanies = async (req, res) => {
  try {
    const { id: account_id } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.name 
       FROM account_companies ac
       JOIN companies c ON ac.company_id = c.id
       WHERE ac.account_id = $1`,
      [account_id]
    );

    const companies = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    return res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching related companies:", error);
    return res.status(500).send("Error retrieving company relations");
  }
};

const updateRelationAccountCompanies = async (req, res) => {
  return;
};

const deleteRelationAccountCompanies = async (req, res) => {
  return;
};

module.exports = {
  registerRelationAccountCompanies,
  getRelationAccountCompanies,
  updateRelationAccountCompanies,
  deleteRelationAccountCompanies,
};
