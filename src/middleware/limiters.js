const { createClient } = require("redis");
const rateLimit = require("express-rate-limit");

const redisClient = createClient({
  socket: {
    host: "localhost",
    port: 6379,
    connectTimeout: 1000,
  },
});

redisClient.on("error", () => {});

const redisRateLimiter = async (req, res, next) => {
  // FAIL-SAFE: If Redis server is not running, just skip to next()
  if (!redisClient.isOpen || !redisClient.isReady) {
    return next();
  }

  const ip = req.ip;
  const key = `rate_limit:${ip}`;
  const DAILY_LIMIT = 3000;

  try {
    const currentCount = await redisClient.incr(key);

    // Set expiration only on the first hit
    if (currentCount === 1) {
      await redisClient.expire(key, 86400); // 24 hours in seconds
    }

    // --- DEBUG CONSOLE LOG ---
    const ttl = await redisClient.ttl(key);
    console.log(
      `[Redis] IP: ${ip} | Hits: ${currentCount}/3000 | Resets in: ${ttl}s`,
    );

    if (currentCount > DAILY_LIMIT) {
      return res.status(429).json({
        message: "You have reached your limit of 3000 requests per day.",
      });
    }

    next();
  } catch (err) {
    next();
  }
};

// -------------------

//* Set up rate limiter: maximum of 10000 requests
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10000, // Limit each IP to 10000 requests per `window`
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

//
redisClient
  .connect()
  .then(async () => {
    console.log("✅ Redis Connected on localhost (via Docker).");

    await redisClient.flushAll();
    console.log("🧹 Redis RAM has been cleared for development.");
  })
  .catch((err) => {
    console.log(
      "⚠️ Redis Server not detected on localhost. Daily limit skipped.",
    );
  });

module.exports = { redisRateLimiter, limiter, customRateLimiter };
