const { pool } = require("../db");

const registerRelationAccountCompanies = async (req, res) => {
  try {
    const { account_id, company_id, rol } = req.body;
  } catch (error) {}

  return;
};

const getRelationAccountCompanies = async (req, res) => {
  return;
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
