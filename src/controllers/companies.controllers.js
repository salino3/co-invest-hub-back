const { pool } = require("../db");
const { SECRET_KEY } = require("../config");

//
const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      hashtags = [],
      sector,
      location,
      investment_min,
      investment_max,
      contacts,
      multimedia = {},
      logo,
    } = req.body;

    // Check required fields
    if (!name || !description || !sector || !location || !contacts) {
      return res.status(400).send("Missing required fields");
    }

    await pool.query(
      "INSERT INTO companies (name, description, hashtags, sector, location, investment_min, investment_max, contacts, multimedia, logo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        name,
        description,
        hashtags,
        sector,
        location,
        investment_min,
        investment_max,
        contacts,
        multimedia,
        logo,
      ]
    );

    return res.status(201).send("Company created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating company");
  }
};

const getCompanies = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies");

    if (result.rows.length === 0) {
      return res.status(404).send("No companies found");
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error fetching companies");
  }
};

module.exports = { createCompany, getCompanies };
