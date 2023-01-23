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
db.users = require('./user.model')(sequelize, DataTypes)
db.companies = require('./company.model')(sequelize, DataTypes)
db.converters = require('./converter.model')(sequelize, DataTypes)
db.customers = require('./customer.model')(sequelize, DataTypes)
db.events = require('./event.model')(sequelize, DataTypes)
db.throughputs = require('./throughput.model')(sequelize, DataTypes)
db.tickets = require('./ticket.model')(sequelize, DataTypes)
db.user_role = require('./user_role.model')(sequelize, DataTypes)

//exporting the module
module.exports = db