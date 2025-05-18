const { pool } = require("../db");

const registerRelationAccountCompanies = async (req, res) => {
  try {
    const { idCreator, account_id, company_id, role } = req.body;

    if (!account_id || !company_id || !role || !idCreator) {
      return res.status(400).send("Missing required fields");
    }

    //* Created index for this sql sentence
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
      `INSERT INTO account_companies (account_id, company_id, role)
       VALUES ($1, $2, $3)`,
      [account_id, company_id, role]
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
      `SELECT c.id, c.name, ac.role 
       FROM account_companies ac
       JOIN companies c ON ac.company_id = c.id
       WHERE ac.account_id = $1`,
      [account_id]
    );

    const companies = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
    }));

    return res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching related companies:", error);
    return res.status(500).send("Error retrieving company relations");
  }
};

const getRelationCompaniesWithAccounts = async (req, res) => {
  try {
    const { id: company_id } = req.params;

    const result = await pool.query(
      `SELECT a.id, a.name, ac.role 
       FROM account_companies ac
       JOIN accounts a ON ac.account_id = a.id
       WHERE ac.company_id = $1`,
      [company_id]
    );

    const accounts = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
    }));

    return res.status(200).json(accounts);
  } catch (error) {
    console.error("Error fetching related companies:", error);
    return res.status(500).send("Error retrieving company relations");
  }
};

const updateRelationAccountCompanies = async (req, res) => {
  try {
    const { account_id, company_id, newRole } = req.body;

    if (!account_id || !company_id || !newRole) {
      return res.status(400).send("Missing required fields");
    }

    // Update the role for a specific account-company relation
    const result = await pool.query(
      `UPDATE account_companies 
       SET role = $1 
       WHERE account_id = $2 AND company_id = $3`,
      [newRole, account_id, company_id]
    );

    // If no rows were affected, the relation does not exist
    if (result.rowCount === 0) {
      return res.status(404).send("Relation not found");
    }

    return res.status(200).send("Role updated successfully");
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).send("Error updating relation");
  }
};

const deleteRelationAccountCompanies = async (req, res) => {
  try {
    const { account_id, company_id } = req.body;

    // Validate if the necessary parameters are present
    if (!account_id || !company_id) {
      return res.status(400).send("Missing account_id or company_id");
    }

    // Delete the relation between the account and the company
    const result = await pool.query(
      `DELETE FROM account_companies WHERE account_id = $1 AND company_id = $2`,
      [account_id, company_id]
    );

    // If no rows were deleted, it means the relation was not found
    if (result.rowCount === 0) {
      return res.status(404).send("Relation not found");
    }

    return res.status(200).send("Relation deleted successfully");
  } catch (error) {
    console.error("Error deleting relation:", error);
    return res.status(500).send("Error deleting relation");
  }
};

module.exports = {
  registerRelationAccountCompanies,
  getRelationAccountCompanies,
  getRelationCompaniesWithAccounts,
  updateRelationAccountCompanies,
  deleteRelationAccountCompanies,
};
