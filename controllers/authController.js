import jwt from 'jsonwebtoken';
import users from '../dao/users.js';
import Users from '../model/user.js';
import sendCommSms from '../utils/smsUtil.js';
import smsBody from '../utils/smsBody.js';

function registerPage(req, res) {
    res.render('register');
};

function loginPage(req, res) {
    return res.render('login');
};

function lookupPage(req, res) {
    res.render('lookup');
};

function userPage(req, res) {
    console.log(req.user);
    res.render('userInfo', {userInfo: req.user});
};

function logout (req, res) {
    res.clearCookie('Authorization').redirect('/');
};

function generateToken (userInfo) {

    const token = jwt.sign({
        id: userInfo.id,
        email: userInfo.email,
    }, global.config.get("jwt.secretkey"), {
        algorithm : 'HS256',
        expiresIn: 60 * 60 * 24 * global.config.get("jwt.expired")
    });

    return token;
};

function validIdentifier(req, res){
    const identifier = String(req.query.identifier).trim();
    const identifierArray = [];
    identifierArray.push(identifier);

    Users.find( { ids: { $all: identifierArray, $size: identifierArray.length }, limit: 1}, function(err, result) {
        if (err) {
            return res.status(500).json({success: false, message: err});
        }

        if(result.length === 1){
            return res.status(400).json({success: false, message: '식별자가 존재합니다.'});
        } else {
            return res.status(200).json({success: true, message: '사용가능한 식별자 입니다.'});
        }
    });
};

async function lookup (req, res) {
    let connection = global.pgConnection;
    let redisDB = global.redisConn;

    try {
        const identifierArr = req.body.identifier.trim().split(',');
        const cellNumber = req.body.cellNumber;

        Users.find( { ids: { $all: identifierArr, $size: identifierArr.length } }, async function(err, result) {
			if (err) {
                return res.status(500).json({success: false, message: err});
            }

            if(result){
                if(result.length === 0){
                    return res.status(400).json({success: false, message: '사용자가 존재하지 않습니다.'});
                }
                
                const userInfo = await users.getUsersById(connection, result[0].id);

                if(userInfo){
                    if(cellNumber !== userInfo[0].cellnumber) {
                        return res.status(400).json({success: false, message: '가입하신 전화번호와 일치하지 않습니다.'});
                    } else {
                        redisDB.exists(cellNumber, function(err, reply) {
                            if(err) {
                                return res.status(500).json({success: false, message: err});
                            } 
                            if (reply === 1) {
                                redisConn.del(cellNumber);
                            }
                        });
                    
                        const checkCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
                      
                        redisDB.setEx(cellNumber, 300, checkCode.toString());
                        
                        const sendDataInfo = smsBody(cellNumber, checkCode);
                    
                        const data = {
                            data: sendDataInfo,
                            id : result[0].id
                        };
                    
                        sendCommSms(data, res);
                    }
                }
            } else {
                return res.status(400).json({success: false, message: '사용자가 존재하지 않습니다.'});
            }
		});
    } catch (e) {
        return res.status(500).json({success: false, message: e});
    }
};

function login(req, res) {
    try {
        const identifierArr = req.body.identifier.trim().split(',');

        Users.find( { ids: { $all: identifierArr, $size: identifierArr.length } }, function(err, result) {
			if (err){
                return res.status(500).json({success: false, message: err});
            }

            if(result){
                if(result.length === 0){
                    return res.status(400).json({success: false, message: '사용자가 존재하지 않습니다.'});
                }
                
                const token = generateToken({
                    id: result[0].id
                });
        
                res.status(200).json({id: result[0].id, token: `Bearer ${token}`});
            } else {
                return res.status(400).json({success: false, message: '사용자가 존재하지 않습니다.'});
            }
		});
    } catch (e) {
        return res.status(500).json({success: false, message: e});
    }
};

async function resetPassword (req, res) {
    let connection = global.pgConnection;

    try {
        connection.startTransaction();

        const password = req.body.password;
        const userId = req.body.id;

        const userInfo = {
            'id' : userId,
            'password' : password
        };

        let data = [];
        await users.updatePassword(connection, userInfo);

        Users.deleteMany({'id': userId}, async function(err, result){
            if(err){
                return res.status(500).json({success: false, message: err});
            } 
            console.log(result);
            if(result) {
                const idArray = await users.getUserIdsById(connection, userId);

                idArray.map(function(value, key){
                    data.push(value.rowToJson);
                });

                Users.insertMany(data, function(err, result){
                    if(err) { 
                        connection.rollback();
                    }

                    if(result) {
                        connection.commit();
                        return res.status(200).json({success : true, message: '비밀번호가 변경되었습니다.'});
                    }
                });
            }
        });

    } catch (error) {
        connection.rollback();
        return res.status(500).json({success: false, message: error});
    }
}

async function join (req, res) {
    
    let connection = global.pgConnection;
    try {

        connection.startTransaction();

        const userInfo = {
            email : req.body.email, 
            nickname: req.body.nickname, 
            cellnumber : req.body.cellNumber,
            password: req.body.password, 
            name: req.body.name
        };

        const returnId = await users.insertUser(connection, userInfo);

        if(returnId.id > 0){
            let data = [];

            const idArray = await users.getUserIdsById(connection, returnId.id);

            idArray.map(function(value, key){
                data.push(value.rowToJson);
            });

            Users.insertMany(data, function(err, result){
                if(err) {
                    return res.status(500).json({success: false, message: err});
                }

                if(result) {
                    connection.commit();
                    const token = generateToken({id: returnId.id});
                    return res.status(200).json({success: true, message: '가입이 완료되었습니다.', token : `Bearer ${token}`});
                }
            });
        }
        
    } catch (e) {
        connection.rollback();
        return res.status(500).json({success: false, message: e});
    }
};
  
export default {
    registerPage,
    loginPage,
    lookupPage,
    userPage,
    login,
    logout,
    join,
    lookup,
    resetPassword,
    validIdentifier
};