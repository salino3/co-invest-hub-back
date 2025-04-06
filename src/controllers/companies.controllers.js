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
      `INSERT INTO companies (name, description, hashtags, sector, location, investment_min, investment_max, contacts, multimedia, logo)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
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

const getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).send("Invalid company ID.");
    }

    const query = "SELECT * FROM companies WHERE id = $1";
    const result = await pool.query(query, [parsedId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Company not found.");
    }

    return res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving company");
  }
};

//
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    hashtags,
    sector,
    location,
    investment_min,
    investment_max,
    contacts,
    logo,
    multimedia,
  } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (hashtags !== undefined) {
      updates.push(`hashtags = $${paramIndex++}`);
      values.push(hashtags);
    }
    if (sector !== undefined) {
      updates.push(`sector = $${paramIndex++}`);
      values.push(sector);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    if (investment_min !== undefined) {
      updates.push(`investment_min = $${paramIndex++}`);
      values.push(investment_min);
    }
    if (investment_max !== undefined) {
      updates.push(`investment_max = $${paramIndex++}`);
      values.push(investment_max);
    }
    if (contacts !== undefined) {
      updates.push(`contacts = $${paramIndex++}`);
      values.push(contacts);
    }
    if (logo !== undefined) {
      updates.push(`logo = $${paramIndex++}`);
      values.push(logo);
    }
    if (multimedia !== undefined) {
      updates.push(`multimedia = $${paramIndex++}`);
      values.push(multimedia);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields were provided for updating." });
    }

    const query = `
      UPDATE companies
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: `No company found with the ID: ${id}` });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating the company:", error);
    res
      .status(500)
      .json({ error: "Error updating the company in the database." });
  }
};

//
const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).send("Invalid company ID.");
    }

    const deleteQuery = `
        DELETE FROM companies 
        WHERE id = $1
      `;

    const result = await pool.query(deleteQuery, [parsedId]);

    if (result.rowCount === 0) {
      return res.status(404).send("Company not found.");
    }

    return res.status(200).send("Company deleted successfully.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error deleting company.");
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getBatchCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
