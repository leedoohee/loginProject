import axios from "axios";
import CryptoJS  from 'crypto-js';

function sendCommSms(dataInfo, res) {
    const date = Date.now().toString();
    const uri = global.config.get('sms.uri');
    const secretKey = global.config.get('sms.secretKey');
    const accessKey = global.config.get('sms.accessKey');
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;

    const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

    hmac.update('POST');
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    hmac.update(accessKey);

    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);

    axios({
        method: 'POST',
        json: true,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-timestamp': date,
          'x-ncp-apigw-signature-v2': signature
        },
        data: dataInfo.data
    })
    .then(function (response) {
        return res.status(200).json({success: true, message : '발송에 성공하였습니다.', userId: dataInfo.id});
    })
    .catch((err) => {
        return res.status(200).json({success: false, message : err});
    });
}

export default sendCommSms;