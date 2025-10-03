// src/lib/redis.ts
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
redis.connect();

export default redis;
