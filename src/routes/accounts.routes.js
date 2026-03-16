const express = require("express");
const accountsController = require("../controllers/accounts.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerAccounts = express.Router();
// n
routerAccounts.get("/accounts", accountsController?.getAccounts);
// n
routerAccounts.get("/accounts/batch", accountsController?.getBatchAccounts);
// n
routerAccounts.get(
  "/accounts/:id",
  verifyJWT("id"),
  accountsController?.getAccountsById,
);
// n
routerAccounts.put(
  "/accounts/:id/:emailParams",
  verifyJWT("id"),
  accountsController?.updateAccount,
);
// y
routerAccounts.patch(
  "/accounts/:id/deactivate",
  verifyJWT("id"),
  accountsController.softDeleteAccount,
);

module.exports = routerAccounts;
