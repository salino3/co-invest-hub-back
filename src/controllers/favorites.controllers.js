const { pool } = require("../db");

const createFavorite = async (req, res) => {
  const { account_id, company_id } = req.body;

  if (!account_id || !company_id) {
    return res
      .status(400)
      .json({ message: "account_id and company_id are required" });
  }

  try {
    const query = `
        INSERT INTO account_favorites (account_id, company_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `;

    const result = await pool.query(query, [account_id, company_id]);

    if (result.rowCount === 0) {
      return res.status(200).json({ message: "Already added to favorites" });
    }

    res.status(201).json({
      message: "Favorite added successfully",
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFavorites = async (req, res) => {
  // const { account_id } = req.params;
  const { id } = req;

  if (!id) {
    return res.status(400).json({ message: "account_id is required" });
  }

  try {
    const query = `
        SELECT array_agg(company_id) AS favorites
        FROM account_favorites
        WHERE account_id = $1;
      `;

    const result = await pool.query(query, [id]);

    res.status(200).json(result.rows[0].favorites || []);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFavorite = async (req, res) => {
  const { account_id, company_id } = req.params;

  if (!account_id || !company_id) {
    return res
      .status(400)
      .json({ message: "account_id and company_id are required" });
  }

  try {
    const query = `
        DELETE FROM account_favorites
        WHERE account_id = $1 AND company_id = $2;
      `;

    const result = await pool.query(query, [account_id, company_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createFavorite, getFavorites, deleteFavorite };
