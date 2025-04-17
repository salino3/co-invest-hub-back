const { pool } = require("../db");

const registerRelationAccountCompanies = async (req, res) => {
  try {
    const { idCreator, account_id, company_id, rol } = req.body;

    if (!account_id || !company_id || !rol || !idCreator) {
      return res.status(400).send("Missing required fields");
    }

    // Check if there is already any relation with the given company
    const existingRelations = await pool.query(
      `SELECT * FROM account_companies WHERE company_id = $1`,
      [company_id]
    );

    // If there are existing relations
    if (existingRelations.rows.length > 0) {
      // Check if the creator is already related to the company
      const creatorRelation = existingRelations.rows.find(
        (row) => row.account_id === idCreator
      );

      if (!creatorRelation) {
        return res
          .status(403)
          .send("Unauthorized: You can't create a relation with this company");
      }
    }

    // Insert the new relation
    await pool.query(
      `INSERT INTO account_companies (account_id, company_id, rol)
       VALUES ($1, $2, $3)`,
      [account_id, company_id, rol]
    );

    return res.status(201).send("Relation created successfully");
  } catch (error) {
    console.error("Error inserting relation:", error);

    // Check if the error is due to a duplicate primary key
    if (error.code === "23505") {
      return res.status(409).send("This relation already exists");
    }

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
