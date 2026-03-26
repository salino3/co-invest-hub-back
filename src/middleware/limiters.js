const rateLimit = require("express-rate-limit");

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Store request counts per IP
const requestCounts = {};

setInterval(
  () => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    console.log("--- Starting Memory Cleanup ---");

    Object.keys(requestCounts).forEach((ip) => {
      const timeSinceLastActive = now - requestCounts[ip].lastRequest;

      if (timeSinceLastActive > twentyFourHours) {
        console.log(`Deleting inactive IP from memory: ${ip}`);
        delete requestCounts[ip];
      }
    });

    console.log("--- Cleanup Finished ---");
  },
  60 * 60 * 1000,
);

// Custom rate limiter middleware
const customRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowTime = 60 * 60 * 1000; // 1 hour window
  const maxRequests = 100;

  if (!requestCounts[ip]) {
    // New user: start the counter and record the start of the window
    requestCounts[ip] = { count: 1, firstRequest: now, lastRequest: now };
  } else {
    const timeInWindow = now - requestCounts[ip].firstRequest;

    if (timeInWindow < windowTime) {
      // Still in the same hour window
      requestCounts[ip].count += 1;
      requestCounts[ip].lastRequest = now; // Update this for our 24h cleanup
    } else {
      // Hour is up! Reset for a new hour
      requestCounts[ip] = { count: 1, firstRequest: now, lastRequest: now };
    }
  }

  if (requestCounts[ip].count > maxRequests) {
    return res.status(429).json({
      message: "Too many requests for this hour. Please wait.",
    });
  }

  next();
};

module.exports = { limiter, customRateLimiter };
