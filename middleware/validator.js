import { validationResult } from 'express-validator';

function paramValidator (req, res, next){
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ success: false, message: validationErrors.array()[0].msg });
    }

    next();
}

export default paramValidator;