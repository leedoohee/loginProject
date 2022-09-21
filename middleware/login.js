import passport from 'passport';

export default function isLoggedIn(req, res, next) {
    if (req.cookies['Authorization']) {
        req.isLoggedIn = true;
    } else {
        req.isLoggedIn = false;
    }

    return next();
};