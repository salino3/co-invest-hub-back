const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const routerAuth = require("./src/routes/auth.routes");
const routerAccounts = require("./src/routes/accounts.routes");
const routerCompanies = require("./src/routes/companies.routes");
const routerRelationAccountCompanies = require("./src/routes/relation-account-companies.routes");
const routerFavorites = require("./src/routes/favorites.routes");
const { PORT } = require("./src/config");

const app = express();

// 'morgan' Library to check API call, some information, milliseconds also
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONT_END_PORT
        : "http://localhost:5500",
    credentials: true,
  })
);

// For static files (images, CSS, etc.)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", routerAuth);
app.use("/api", routerAccounts);
app.use("/api", routerCompanies);
app.use("/api", routerFavorites);
app.use("/api/relation", routerRelationAccountCompanies);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
