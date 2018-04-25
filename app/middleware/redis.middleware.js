const redis = require('redis')
import { redisConfig } from '../config/index';
const redisClient = redis.createClient(redisConfig);
redisClient.select(1,(res)=>{
	console.log(res)
})
export function setItem(key, value, exprires) {
    redisClient.set(key, value);
    if (exprires) {
        redisClient.expire(key, exprires);
    }
}
export function getItem(key, cb) {
    redisClient.get(key, cb)
}
export function pushItem(key, value, cb) {
    redisClient.rpush(key, value, cb);
}
export function getList(key, cb) {
    redisClient.lrange(key, 0, -1, cb);
}