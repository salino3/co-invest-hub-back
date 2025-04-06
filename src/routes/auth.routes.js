const express = require("express");
const authController = require("../controllers/auth.controllers");

const routerAuth = express.Router();

routerAuth.post("/register", authController?.registerAccount);

routerAuth.post("/login", authController.loginAccount);

module.exports = routerAuth;
