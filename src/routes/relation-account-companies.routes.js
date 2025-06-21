const express = require("express");
const relationAccountCompaniesController = require("../controllers/relation-account-companies.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerRelationAccountCompanies = express.Router();

routerRelationAccountCompanies.post(
  "/account/companies",
  verifyJWT("", "idCreator"),
  relationAccountCompaniesController?.registerRelationAccountCompanies
);

// Get all companies related with the account
routerRelationAccountCompanies.get(
  "/account/companies/:id",
  relationAccountCompaniesController?.getRelationAccountCompanies
);

// Get all accounts related with the company
routerRelationAccountCompanies.get(
  "/company/accounts/:id",
  relationAccountCompaniesController?.getRelationCompaniesWithAccounts
);

routerRelationAccountCompanies.patch(
  "/account/companies",
  verifyJWT("", "account_id"),
  relationAccountCompaniesController.updateRelationAccountCompanies
);

routerRelationAccountCompanies.delete(
  "/account/companies",
  verifyJWT("", "account_id"),
  relationAccountCompaniesController.deleteRelationAccountCompanies
);

module.exports = routerRelationAccountCompanies;
