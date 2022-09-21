import express from 'express';
import authRouter from './router/authRouter.js';
import dbConnection from './utils/dbConnection.js';
import redisConnection from './utils/redisConnection.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import homeRouter from './router/homeRouter.js';
import smsRouter from './router/smsRouter.js';
import config from 'config';

const app = express();

const dbconfig = {
    host: config.get('postgresql.host'),
    user: config.get('postgresql.user'),
    password: config.get('postgresql.password'),
    database: config.get('postgresql.database'),
    port: config.get('postgresql.port')
};

const redisInfo = {
    host : config.get('redis.host'),
    port : config.get('redis.port'),
    db : config.get('redis.db')
};

const mongodb = 'mongodb://localhost:27017/test';

const client = redisConnection(redisInfo);
client.connect();

global.pgConnection = dbConnection.getPool(dbconfig);
dbConnection.getMongoConnecion(mongodb);
global.redisConn = client;
global.config = config;

app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: false}));
app.use(bodyParser.raw());
app.use(function (req, res, next) {
    res.set('Access-Control-Allow-Credentials', true);
    res.set("Access-Control-Allow-Origin", "*");
    res.set('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.set("Access-Control-Allow-Headers",
        'X-API-Version, X-Accept-Language, X-Accept-Currency, X-Access-Token, X-Requested-With, Origin, Cookie, Authorization, Content-Type, Accept, Platform');
    res.set('Access-Control-Expose-Headers', 'Content-Disposition');
    next();
}); 

app.use(authRouter);
app.use(homeRouter);
app.use(smsRouter);

app.listen(80, function() {
    console.log('start! server');
})