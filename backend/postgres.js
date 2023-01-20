const { Pool } = require('pg')
const pool = new Pool({
  user: "clinica",
  host: "localhost",
  database: "bookstest",
  password: "clinica",
  port: "5432"
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}
