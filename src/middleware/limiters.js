const { createClient } = require("redis");
const rateLimit = require("express-rate-limit");

// docker run -d --name redis-practice -p 6379:6379 redis:latest
const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
    connectTimeout: 1000,
  },
});

redisClient.on("error", () => {});

const redisRateLimiter = async (req, res, next) => {
  // Check if client is connected
  if (!redisClient.isOpen) {
    console.log("⚠️ Redis connection closed. Skipping...");
    return next();
  }

  // Clean up the IP address (converts ::1 to 127.0.0.1 for cleaner keys)
  const ip = req.ip.replace("::ffff:", "").replace("::1", "127.0.0.1");
  const key = `rate_limit:${ip}`;
  const DAILY_LIMIT = 3000;

  console.log("🚀 Processing Rate Limit for:", key);

  try {
    // Create the multi-chain
    const multi = redisClient.multi();
    multi.incr(key);
    multi.expire(key, 86400, "NX");

    // Execute the chain
    const results = await multi.exec();

    // results will be an array: [newCount, expireStatus]
    const currentCount = results[0];

    console.log(`clog: IP ${ip} - Count: ${currentCount}`);

    if (currentCount > DAILY_LIMIT) {
      return res.status(429).json({
        message: `IP ${ip} has reached the limit of 3000 requests per day.`,
      });
    }

    next();
  } catch (err) {
    console.error("❌ Redis Middleware Error:", err);
    // If Redis fails, we still want the user to see the website
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
