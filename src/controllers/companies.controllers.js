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
      multimedia = [],
      logo,
    } = req.body;

    // Check required fields
    if (!name || !description || !sector || !location || !contacts) {
      return res.status(400).send("Missing required fields");
    }

    const hashtagsString = JSON.stringify(hashtags);
    const multimediaString = JSON.stringify(multimedia);

    await pool.query(
      "INSERT INTO companies (name, description, hashtags, sector, location, investment_min, investment_max, contacts, multimedia, logo) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9::jsonb, $10)",
      [
        name,
        description,
        hashtagsString,
        sector,
        location,
        investment_min,
        investment_max,
        contacts,
        multimediaString,
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

const getBatchCompanies = async (req, res) => {
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

    if (Math.abs(parsedLimit - parsedOffset) > 10) {
      return res
        .status(400)
        .send(
          "The difference between limit and offset cannot be greater than 10."
        );
    }

    // 'offset 10' starts returning index 10, it is eleventh account in the list
    const query = `
          SELECT * FROM  companies
          LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [parsedLimit, parsedOffset]);

    if (result.rows.length === 0) {
      return res.status(404).send("No companies found.");
    }

    return res.status(200).send(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

module.exports = { createCompany, getCompanies, getBatchCompanies };
