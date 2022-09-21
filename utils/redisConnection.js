import redis from 'redis';

function redisConnection(config) {
    return redis.createClient(config);
};

export default redisConnection;