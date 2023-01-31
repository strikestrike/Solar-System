//importing modules
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

//Database connection with dialect of postgres specifying the database we are using
//port for my database is 5432
//database name is discover
const sequelize = new Sequelize(process.env.DEV_DATABASE_URL, { dialect: "postgres" })

//checking if connection is done
sequelize.authenticate().then(() => {
    console.log(`Database connected to discover`)
}).catch((err) => {
    console.log(err)
})

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

//connecting to model
db.User = require('./user.model')(sequelize, DataTypes)
db.Company = require('./company.model')(sequelize, DataTypes)
db.Converter = require('./converter.model')(sequelize, DataTypes)
db.Event = require('./event.model')(sequelize, DataTypes)
// db.Throughput = require('./throughput.model')(sequelize, DataTypes)
db.Ticket = require('./ticket.model')(sequelize, DataTypes)

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

//exporting the module
module.exports = db