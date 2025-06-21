const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerCompanies = express.Router();

routerCompanies.post("/companies", companiesController?.createCompany);

routerCompanies.get("/companies", companiesController?.getCompanies);

routerCompanies.get("/companies/batch", companiesController?.getBatchCompanies);

routerCompanies.get("/companies/:id", companiesController?.getCompanyById);

routerCompanies.post(
  "/searching/companies",
  companiesController?.getSearchingCompanies
);

routerCompanies.put(
  "/companies/:id",
  verifyJWT("id"),
  companiesController?.updateCompany
);

routerCompanies.delete(
  "/companies/:id",
  verifyJWT("id"),
  companiesController?.deleteCompany
);

module.exports = routerCompanies;
