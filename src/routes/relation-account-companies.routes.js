const express = require("express");
const relationAccountCompaniesController = require("../controllers/relation-account-companies.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerRelationAccountCompanies = express.Router();
// y
routerRelationAccountCompanies.post(
  "/account/companies",
  verifyJWT("", "idCreator"),
  relationAccountCompaniesController?.registerRelationAccountCompanies,
);
// y
// Get all companies related with the account
routerRelationAccountCompanies.get(
  "/account/companies/:id",
  relationAccountCompaniesController?.getRelationAccountCompanies,
);
// y
// Get all accounts related with the company
routerRelationAccountCompanies.get(
  "/company/accounts/:id",
  relationAccountCompaniesController?.getRelationCompaniesWithAccounts,
);
// y
routerRelationAccountCompanies.patch(
  "/account/companies",
  verifyJWT("", "account_id"),
  relationAccountCompaniesController.updateRelationAccountCompanies,
);
// n
routerRelationAccountCompanies.delete(
  "/account/companies",
  verifyJWT("", "account_id"),
  relationAccountCompaniesController.deleteRelationAccountCompanies,
);

module.exports = routerRelationAccountCompanies;
