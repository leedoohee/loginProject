
import checkToken from '../middleware/auth.js';
import isLoggedIn from '../middleware/login.js';
import authController from '../controllers/authController.js';
import express from 'express';
import { check } from "express-validator";
import paramValidator from '../middleware/validator.js';

const authRouter = express.Router();

authRouter.get('/register', authController.registerPage);
authRouter.get('/login', authController.loginPage);

authRouter.post('/join', [
    check("name", "이름은 필수값입니다.").not().isEmpty(),
    check("email", "메일은 필수값입니다.").isEmail(),
    check("nickname", "닉네임은 필수값입니다.").not().isEmpty(),
    check("password", "비밀번호는 필수값입니다.").not().isEmpty(),
    check("cellNumber", "핸드폰번호는 필수값입니다.").not().isEmpty()
], paramValidator, authController.join);

authRouter.post('/login', [
    check("identifier", "ID는 필수값입니다.").not().isEmpty()
], paramValidator, authController.login);

authRouter.get('/logout', isLoggedIn, authController.logout);
authRouter.get('/lookup', authController.lookupPage);

authRouter.post('/lookup', [
    check("identifier", "ID는 필수값입니다.").not().isEmpty(),
    check("cellNumber", "핸드폰번호는 필수값입니다.").not().isEmpty()
], paramValidator, authController.lookup);

authRouter.put('/reset/password', [
    check("password", "비밀번호는 필수값입니다.").not().isEmpty(),
    check("id", "유저아이디는 필수값입니다.").not().isEmpty()
], paramValidator, authController.resetPassword);

authRouter.get('/userInfo', checkToken, authController.userPage);
authRouter.get('/valid/identifier', authController.validIdentifier);

export default authRouter;