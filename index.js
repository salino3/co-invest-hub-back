const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const routerAuth = require("./src/routes/auth.routes");
const routerAccounts = require("./src/routes/accounts.routes");
const routerCompanies = require("./src/routes/companies.routes");
const routerRelationAccountCompanies = require("./src/routes/relation-account-companies.routes");
const routerFavorites = require("./src/routes/favorites.routes");
const { PORT } = require("./src/config");

const app = express();

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Store request counts per IP
const requestCounts = {};

// Custom rate limiter middleware
const customRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 1, lastRequest: now };
  } else {
    console.log("clog1", requestCounts[ip]);
    const timeSinceLastRequest = now - requestCounts[ip].lastRequest;
    console.log("clog2", timeSinceLastRequest);

    const timeLimit = 60 * 60 * 1000; // 1 hour

    if (timeSinceLastRequest < timeLimit) {
      requestCounts[ip].count += 1;
    } else {
      requestCounts[ip] = { count: 1, lastRequest: now }; // Reset after time window
    }
  }

  const maxRequests = 100;

  if (requestCounts[ip].count > maxRequests) {
    return res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  }

  requestCounts[ip].lastRequest = now;
  next();
};

// Apply the custom rate limiter
app.use(customRateLimiter);

// Apply the rate limiter to all requests
app.use(limiter);

// 'morgan' Library to check API call, some information, milliseconds also
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
//  app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONT_END_PORT
        : "http://localhost:5500",
    credentials: true,
  }),
);

// For static files (images, CSS, etc.)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", routerAuth);
app.use("/api", routerAccounts);
app.use("/api", routerCompanies);
app.use("/api", routerFavorites);
app.use("/relation", routerRelationAccountCompanies);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
