import {createClient} from "redis"

const redisConnect = createClient({
    url:process.env.REDIS_URL,
    token:process.env.REDIS_TOKEN
})

redisConnect.on("error",(error)=>{
    console.log("Error while connecting to Redis: ",error)
})

redisConnect.on("connect",()=>{
    console.log("Connected to Redis, Successfully")
})

export default redisConnect