import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redis = Redis.fromEnv();

const make = (requests, window, prefix) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  });

export const globalLimiter = make(300, "60 s", "freshmart:rl:global");

export const authLimiter = make(10, "15 m", "freshmart:rl:auth");

export const otpSendLimiter = make(5, "10 m", "freshmart:rl:otp:send");
export const otpVerifyLimiter = make(5, "10 m", "freshmart:rl:otp:verify");
