const express = require("express");
const favoritesController = require("../controllers/favorites.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerFavorites = express.Router();
// y
routerFavorites.post(
  "/favorites",
  verifyJWT("", "account_id"),
  favoritesController?.createFavorite,
);
// y
routerFavorites.get(
  "/favorites/:id",
  verifyJWT("id"),
  favoritesController?.getFavorites,
);
// y
routerFavorites.delete(
  "/favorites/:account_id/:company_id",
  verifyJWT("account_id"),
  favoritesController?.deleteFavorite,
);

module.exports = routerFavorites;
