const db = require('../config/db.config');

exports.signin = async (email, password, callback) => {
    console.log(email);
    const { rows } = await db.query("SELECT * FROM users where email = $1 and password = $2;", [email, password]);
    // const {rows} = await db.query("SELECT * FROM users");
    callback(null ,rows);
}