const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");

// Connect to Redis (default Redis uses localhost:6379)
const redis = new Redis();

const redisRateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const key = `rate_limit:${ip}`;
  const DAILY_LIMIT = 3000;
  const TWENTY_FOUR_HOURS = 24 * 60 * 60; // Redis uses seconds

  try {
    // 1. Increment the count for this IP
    const currentCount = await redis.incr(key);

    // 2. If it's the first time this IP is seen, set the 24h expiration
    if (currentCount === 1) {
      await redis.expire(key, TWENTY_FOUR_HOURS);
    }

    // 3. Check the limit
    if (currentCount > DAILY_LIMIT) {
      return res.status(429).json({
        message: "You have reached your limit of 3000 requests per day.",
      });
    }

    // Update 'lastRequest' isn't needed here because EXPIRE handles the cleanup!
    next();
  } catch (err) {
    console.error("Redis Error:", err);
    next(); // Move on if Redis fails so you don't block users
  }
};

//* Set up rate limiter: maximum of 10000 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10000, // Limit each IP to 10000 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again later",
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
  const windowTime = 1000; // 1 seconds
  const maxRequests = 10;

  if (!requestCounts[ip]) {
    // New user: start the counter and record the start of the window
    requestCounts[ip] = { count: 1, firstRequest: now, lastRequest: now };
  } else {
    const timeInWindow = now - requestCounts[ip].firstRequest;

    if (timeInWindow < windowTime) {
      // Still in the same time window
      requestCounts[ip].count += 1;
      requestCounts[ip].lastRequest = now; // Update this for 1 second cleanup
    } else {
      // Time is up! Reset
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

// This runs once when the file is loaded (at server start)
if (process.env.NODE_ENV !== "production") {
  redis
    .flushall()
    .then(() => {
      console.log("?? Redis has been cleared for development mode.");
    })
    .catch((err) => {
      console.error("?? Failed to clear Redis:", err);
    });
}

module.exports = { redisRateLimiter, limiter, customRateLimiter };
