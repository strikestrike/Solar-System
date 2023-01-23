module.exports = app => {
    const user = require('../controllers/user.controller');
    var router = require("express").Router();

    // User Routing
    router.get('/signin', user.singin);

    app.use('/api/', router);
};