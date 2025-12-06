import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl);

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Refresh token store
export const refreshTokenStore = {
  async set(userId: string, token: string, expiresInSeconds: number): Promise<void> {
    await redis.setex(`refresh:${userId}:${token}`, expiresInSeconds, "valid");
  },

  async isValid(userId: string, token: string): Promise<boolean> {
    const result = await redis.get(`refresh:${userId}:${token}`);
    return result === "valid";
  },

  async revoke(userId: string, token: string): Promise<void> {
    await redis.del(`refresh:${userId}:${token}`);
  },

  async revokeAll(userId: string): Promise<void> {
    const keys = await redis.keys(`refresh:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};
