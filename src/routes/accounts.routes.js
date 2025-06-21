const express = require("express");
const accountsController = require("../controllers/accounts.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerAccounts = express.Router();

routerAccounts.get("/accounts", accountsController?.getAccounts);

routerAccounts.get("/accounts/batch", accountsController?.getBatchAccounts);

routerAccounts.get(
  "/accounts/:id",
  verifyJWT("id"),
  accountsController?.getAccountsById
);

routerAccounts.put(
  "/accounts/:id/:emailParams",
  verifyJWT("id"),
  accountsController?.updateAccount
);

routerAccounts.patch(
  "/accounts/:id/deactivate",
  verifyJWT("id"),
  accountsController.softDeleteAccount
);

module.exports = routerAccounts;
