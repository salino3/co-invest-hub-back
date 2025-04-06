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
  const { id } = req.params; // Assuming the company ID is passed as a route parameter
  const {
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
  } = req.body;

  try {
    // Check if the company ID is provided
    if (!id) {
      return res.status(400).send("Missing company ID");
    }

    const updates = {};
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.name = `$${paramCount++}`;
      values.push(name);
    }
    if (description !== undefined) {
      updates.description = `$${paramCount++}`;
      values.push(description);
    }
    if (hashtags !== undefined) {
      updates.hashtags = `$${paramCount++}::jsonb`;
      values.push(JSON.stringify(hashtags));
    }
    if (sector !== undefined) {
      updates.sector = `$${paramCount++}`;
      values.push(sector);
    }
    if (location !== undefined) {
      updates.location = `$${paramCount++}`;
      values.push(location);
    }
    if (investment_min !== undefined) {
      updates.investment_min = `$${paramCount++}`;
      values.push(investment_min);
    }
    if (investment_max !== undefined) {
      updates.investment_max = `$${paramCount++}`;
      values.push(investment_max);
    }
    if (contacts !== undefined) {
      updates.contacts = `$${paramCount++}::jsonb`;
      values.push(JSON.stringify(contacts));
    }
    if (multimedia !== undefined) {
      updates.multimedia = `$${paramCount++}::jsonb`;
      values.push(JSON.stringify(multimedia));
    }
    if (logo !== undefined) {
      updates.logo = `$${paramCount++}`;
      values.push(logo);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).send("No fields to update");
    }

    const setClauses = Object.keys(updates)
      .map((key) => `${key} = ${updates[key]}`)
      .join(", ");

    const query = `
        UPDATE companies
        SET ${setClauses}, updated_at = NOW()
        WHERE id = $${paramCount}
      `;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send(`Company with ID ${id} not found`);
    }

    return res.status(200).send(`Company with ID ${id} updated successfully`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating company");
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
