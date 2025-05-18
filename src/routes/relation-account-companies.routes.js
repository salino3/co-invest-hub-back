const express = require("express");
const relationAccountCompaniesController = require("../controllers/relation-account-companies.controllers");

const routerRelationAccountCompanies = express.Router();

routerRelationAccountCompanies.post(
  "/account/companies",
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
  relationAccountCompaniesController.updateRelationAccountCompanies
);

routerRelationAccountCompanies.delete(
  "/account/companies",
  relationAccountCompaniesController.deleteRelationAccountCompanies
);

module.exports = routerRelationAccountCompanies;
