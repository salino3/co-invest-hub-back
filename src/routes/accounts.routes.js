const express = require("express");
const accountsController = require("../controllers/accounts.controllers");

const routerAccounts = express.Router();

routerAccounts.get("/accounts", accountsController?.getAccounts);

routerAccounts.get("/accounts/batch", accountsController?.getBatchAccounts);

routerAccounts.get("/accounts/:id", accountsController?.getAccountsById);

routerAccounts.put(
  "/accounts/:id/:emailParams",
  accountsController?.updateAccount
);

routerAccounts.patch(
  "/accounts/:id/deactivate",
  accountsController.softDeleteAccount
);

module.exports = routerAccounts;
