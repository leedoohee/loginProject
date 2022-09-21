import smsController from '../controllers/smsController.js';
import express from 'express';
import paramValidator from '../middleware/validator.js';
import { check } from 'express-validator';

const smsRouter = express.Router();

smsRouter.post('/sms/send', [
    check("cellNumber", "핸드폰번호는 필수값입니다.").not().isEmpty()
], paramValidator, smsController.sendSMS);
smsRouter.post('/sms/checkNumber', [
    check("codeNumber", "인증번호는 필수값입니다.").not().isEmpty(),
    check("cellNumber", "핸드폰번호는 필수값입니다.").not().isEmpty()
], paramValidator, smsController.checkNumber);

export default smsRouter;