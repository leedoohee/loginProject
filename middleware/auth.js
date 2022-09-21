import jwt from 'jsonwebtoken';
import users from '../dao/users.js';

export default async function checkToken (req, res, next) {

    let connection = global.pgConnection;

    try {
        const cookie = req.cookies['Authorization'];

        if(!(cookie && cookie.startsWith('Bearer'))){
            return res.status(401).json('');
        }

        const token = cookie.split(' ')[1];
        const decoded = jwt.verify(token, global.config.get('jwt.secretkey'));
        const userInfo = await users.getUsersById(connection, decoded.id);
        req.user = userInfo;
        return next();
    } catch (err) {
        if (err.name == 'TokenExpiredError') {
            return res.status(419).json({success: false, message : "token이 만료되었습니다."});
        }
        
        return res.status(401).json({success: false, message : "token이 유효하지 않습니다."});
    }
};
