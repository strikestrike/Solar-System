var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var route = require("./routes/index.js");
const cookieParser = require('cookie-parser');
const db = require('./models/model');

var app = express();
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been synced");
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to visit our solor backend" });
});

route(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
