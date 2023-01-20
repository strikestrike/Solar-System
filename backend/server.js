var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var route = require("./routes/index.js");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors("*"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get("/", (req, res) => {
  res.json({ message: "Welcome to visit our solor backend"});
});

route(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
