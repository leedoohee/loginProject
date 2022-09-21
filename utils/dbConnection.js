import _ from 'lodash';
import pg from 'pg';
import named from 'node-postgres-named';
import wrapper from './connectionUtil.js';
import mongoose from 'mongoose';

function getMongoConnecion (config) {
    mongoose.connect(config);
    return mongoose.connection;
};

function getPool(config) {
    let conn;

    // pg 모듈 버전 대응
    if (typeof pg.Pool === 'function') {
        conn = new pg.Pool(config);
    } else {
        conn = pg.pools.getOrCreate(config);
    }

    const poolCluster = wrapper(conn);

    poolCluster.get = (name) => {
        return new Promise((resolve, reject) => {
            poolCluster.connect((err, client, done) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    client.release = done;
                    resolve(named.patch(utils.wrapper(client)));
                }
            });
        });
    };

    poolCluster.call = ({res, func}) => {
        let conn;
        return poolCluster.get().then((client) => {
            conn = client;
            return func(conn);
        }).catch((e) => {
            if (conn && conn.rollback) {
                console.log('@@@@poolCluster.call - rollback');
                conn.rollback();
            }
            throw e;
        }).finally(() => {
            if (conn && conn.release) {
                console.log('@@@@poolCluster.call - finally');
                conn.release();
            }
        });
    }

    return poolCluster;
}

export default {
    getPool,
    getMongoConnecion
};