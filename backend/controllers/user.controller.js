const db = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = db.users;

exports.singin = async (req, res) => {
    try{
        const { email, password } = req.query;
        const user = await User.findOne({where:{email: email}});
        if(user) {
            const isSame = await bcrypt.compare(password, user.password);
    
            if(isSame) {
                let token = jwt.sign({ id: user.id}, process.env.secretKey, {
                    expiresIn: 1*24*60*60*1000
                });
    
                res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
                console.log("user", JSON.stringify(user, null, 2));
                console.log(token);
                //send user data
                return res.status(201).send({success: true, user});
            }else {
                return res.status(201).send({success: false, message:"Password does not correct"});
            }
        }else {
            return res.status(201).send({success: false, message:"User does not exists"});
        }
    }catch(error) {
        return res.status(201).send({success: false, message:"Server error"});
    }
}