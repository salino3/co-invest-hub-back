const express = require("express");
const companiesController = require("../controllers/companies.controllers");

const routerCompanies = express.Router();

routerCompanies.post("/companies", companiesController?.createCompany);

routerCompanies.get("/companies", companiesController?.getCompanies);

routerCompanies.get("/companies/batch", companiesController?.getBatchCompanies);

routerCompanies.get("/companies/:id", companiesController?.getCompanyById);

routerCompanies.post(
  "/searching/companies",
  companiesController?.getSearchingCompanies
);

routerCompanies.put("/companies/:id", companiesController?.updateCompany);

routerCompanies.delete("/companies/:id", companiesController?.deleteCompany);

module.exports = routerCompanies;
