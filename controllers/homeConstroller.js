function homePage(req, res) {
    res.render('home', {isLogin : req.isLoggedIn});
};

export default {
    homePage
};