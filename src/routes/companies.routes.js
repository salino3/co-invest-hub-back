const express = require("express");
const companiesController = require("../controllers/companies.controllers");

const routeCompanies = express.Router();

routeCompanies.post("/companies", companiesController?.createCompany);

routeCompanies.get("/companies", companiesController?.getCompanies);

module.exports = routeCompanies;
