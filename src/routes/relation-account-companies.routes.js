const express = require("express");
const relationAccountCompaniesController = require("../controllers/relation-account-companies.controllers");

const routerRelationAccountCompanies = express.Router();

routerRelationAccountCompanies.post(
  "/account/companies",
  relationAccountCompaniesController?.registerRelationAccountCompanies
);

routerRelationAccountCompanies.get(
  "/account/companies/:id",
  relationAccountCompaniesController?.getRelationAccountCompanies
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
