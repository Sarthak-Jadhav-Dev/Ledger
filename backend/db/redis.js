import { Redis } from "@upstash/redis"

const redisClient = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
})

export default redisClient