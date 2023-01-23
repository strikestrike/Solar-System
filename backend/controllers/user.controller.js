const UserModel = require('../models/user.model');

exports.singin = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    await UserModel.signin(email, password, (err, data) => {
        console.log(data);
        res.send(data);
    });
}