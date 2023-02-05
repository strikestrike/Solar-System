var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var route = require("./routes/index.js");
const cookieParser = require('cookie-parser');
const { Umzug, SequelizeStorage } = require('umzug');
const db = require('./models/model');
const scheduledFunctions = require('./cron_job');

global.constant = require('./util/constant');
global.__basedir = __dirname;

var app = express();
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

sequelize = db.sequelize;

var seeder = new Umzug({
  migrations: {
    params: [
      db.sequelize.getQueryInterface(),
      sequelize
    ],
    glob: ['seeders/*.js', { cwd: __dirname }]
  },
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'seeders'
  }),
  logger: console
})

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been synced");
  seeder.up()
});

scheduledFunctions.initScheduledJobs();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to visit our solor backend" });
});

route(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
