function smsBody(cellNumber, checkCode) {

    const sendDataInfo = {
        type: global.config.get('sms.type'),
        contentType: global.config.get('sms.contentType'),
        countryCode: global.config.get('sms.countryCode.KR'),
        from: global.config.get('sms.from'),
        content: `인증번호 [${checkCode}]를 입력해주세요.`,
        messages: [
          {
            to: `${cellNumber}`,
          },
        ],
    };
    return sendDataInfo;
}

export default smsBody;