const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const { verifyJWT } = require("../middleware/verify-token");

const routerCompanies = express.Router();
// y
routerCompanies.post("/companies", companiesController?.createCompany);
// y
routerCompanies.get("/companies", companiesController?.getCompanies);

routerCompanies.get("/companies/batch", companiesController?.getBatchCompanies);
// y
routerCompanies.get("/companies/:id", companiesController?.getCompanyById);
// y
routerCompanies.post(
  "/searching/companies",
  companiesController?.getSearchingCompanies,
);
// y
routerCompanies.put(
  "/companies/:id/:idAccount",
  verifyJWT("idAccount"),
  companiesController?.updateCompany,
);
// y
routerCompanies.delete(
  "/companies/:id/:idCompany",
  verifyJWT("id"),
  companiesController?.deleteCompany,
);

module.exports = routerCompanies;
