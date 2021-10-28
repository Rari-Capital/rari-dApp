import Redis from "ioredis";

const redis: Redis.Redis = new Redis(process.env.REDIS_URL);

export default redis;
