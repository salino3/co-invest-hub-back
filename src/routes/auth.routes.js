const express = require("express");
const authController = require("../controllers/auth.controllers");

const routerAuth = express.Router();

routerAuth.post("/accounts/register", authController?.registerAccount);

routerAuth.post("/accounts/login", authController.loginAccount);

module.exports = routerAuth;
