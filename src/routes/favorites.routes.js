const express = require("express");
const favoritesController = require("../controllers/favorites.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerFavorites = express.Router();

routerFavorites.post("/favorites", favoritesController?.createFavorite);

routerFavorites.get(
  "/favorites/:account_id",
  verifyJWT("account_id"),
  favoritesController?.getFavorites
);

routerFavorites.delete(
  "/favorites/:account_id/:company_id",
  verifyJWT("account_id"),
  favoritesController?.deleteFavorite
);

module.exports = routerFavorites;
