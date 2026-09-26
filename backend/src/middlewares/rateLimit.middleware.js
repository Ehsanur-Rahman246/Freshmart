import {
  globalLimiter,
  authLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../config/upstash.js";

const createRateLimit = (limiter, keyFn) => async (req, res, next) => {
  try {
    const key = keyFn ? keyFn(req) : req.ip;
    const { success } = await limiter.limit(key);

    if (!success) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    // fail open: an Upstash outage shouldn't take the API down
    console.error("Rate limiter error:", error.message);
    next();
  }
};

// login: per IP + email, so rotating IPs against one account doesn't help
export const loginRateLimit = createRateLimit(
  authLimiter,
  (req) => `${req.ip}:${req.body?.email?.trim().toLowerCase() || ""}`,
);

export const globalRateLimit = createRateLimit(globalLimiter);
export const authRateLimit = createRateLimit(authLimiter);

// OTP: keyed by IP + user/email together, so an attacker can't cheaply
// burn a victim's quota purely by IP-hopping or purely by knowing their email
const otpKey = (req) =>
  `${req.ip}:${req.user?.userId?.toString() || req.body?.email?.trim().toLowerCase() || ""}`;

export const otpSendRateLimit = createRateLimit(otpSendLimiter, otpKey);
export const otpVerifyRateLimit = createRateLimit(otpVerifyLimiter, otpKey);

