const express = require("express");
const authController = require("../controllers/auth.controllers");

const routerAuth = express.Router();
// y
routerAuth.post("/register", authController?.registerAccount);
// y
routerAuth.post("/login", authController.loginAccount);

module.exports = routerAuth;
