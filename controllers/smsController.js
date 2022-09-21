import sendCommSms from '../utils/smsUtil.js';
import smsBody from '../utils/smsBody.js';

function sendSMS (req, res) {
    let redisDB = global.redisConn;

    const cellNumber = req.body.cellNumber;
  
    redisDB.exists(cellNumber, function(err, reply) {
        if(err) {
            return res.status(500).json({success: false, message: err});
        }

        if (reply === 1) {
            redisConn.del(cellNumber);
        }
    });

    const checkCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  
    redisDB.setEx(cellNumber, 180, checkCode.toString());
    
    const sendDataInfo = smsBody(cellNumber, checkCode);

    const data = {
        data: sendDataInfo
    };

    sendCommSms(data, res);
};


async function checkNumber (req, res) {
    let redisDB = global.redisConn;
    const cellNumber = req.body.cellNumber;
    const codeNumber = req.body.codeNumber;
    const cacheData = await redisDB.get(cellNumber, function(err, data) {
        if (err) {
            return res.status(500).json({success: false, message: err});
        } else {
            return data;
        }
    });

    if (!cacheData) {
        return res.status(500).json({success : false, message: '인증에 실패했습니다.(인증번호 없음.)'}); 
    } else if (cacheData !== String(codeNumber)) {
        return res.status(500).json({success : false, message: '인증에 실패했습니다.(인증번호 다름.)'}); 
    } else {
        redisDB.del(cellNumber);
        return res.status(200).json({success : true, message: '인증되었습니다.'});     
    }
};

export default {
    sendSMS,
    checkNumber
};