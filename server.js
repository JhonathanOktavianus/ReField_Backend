const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
require("dotenv").config();
var cors = require("cors");
var uuid = require("uuid");
var md5 = require("md5");
// parse application/json
app.use(bodyParser.json());
app.use(cors());
app.use(function (error, request, response, next) {
  console.log("Error handler: ", error);

  response.status(500).json({ error: error.message });

});
//create database connection
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
//connect to database
conn.connect((err) => {
  if (!err) {
    console.log("Connected");
    var sqlTableAccount = `
      CREATE TABLE IF NOT EXISTS account (
        id_account INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY(id_account))`;

    conn.query(sqlTableAccount, function (err, result) {
      var checkRowAccount = "SELECT COUNT(*) as total FROM account";
      conn.query(checkRowAccount, function (errs, results) {
        if (results[0].total == 0) {
          var sqlAccountDummy = `
            INSERT INTO account (id_account, email, password) VALUES
              ('1','admin@gmail.com',md5('Standar123.')),
              ('2','example@gmail.com',md5('Standar123.'))`;
          conn.query(sqlAccountDummy, function (errs, resultst) {
            if (errs) throw errs;
          });
          if (err) throw err;
        }
        if (errs) throw errs;
      });
    });

  } else {
    console.log("Connection Failed");
  }
});

/**** START  CRUD ACCOUNT *****/
//login api

//show all account
app.get("/api/accounts", (req, res) => {
  let sql = "SELECT * FROM account";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//show single account
app.get("/api/accounts/:id", (req, res) => {
  let sql = "SELECT * FROM account WHERE id_account = ?";
  let query = conn.query(sql, [req.params.id], (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//update account
app.put("/api/accounts/:id", (req, res, next) => {
  try {
    let sql =
      "UPDATE account SET email = ? , password = ? WHERE id_account = ?";
    let query = conn.query(
      sql,
      [req.body.email, md5(req.body.password), req.params.id],
      (err, results) => {
        res.send(JSON.stringify({ error: err, response: results }));
      }
    );
  } catch (error) {
    return error.message;
  }
});

//Delete users
app.delete("/api/accounts/:id", (req, res) => {
  let sql = "DELETE FROM account WHERE id_account = ?";
  let query = conn.query(sql, [req.params.id], (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//LOGIN USERTS
app.post("/api/login", function (req, res) {
  let sql = "SELECT * FROM account WHERE email = ?  AND password = ? LIMIT 1";

  conn.query(sql, [req.body.email, md5(req.body.password)], (err, results) => {
    if (err) throw err;
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        response: results,
        token: uuid.v4(),
      })
    );
  });
});

//post account
app.post("/api/register", function (req, res) {
  try {
    let sql = `INSERT INTO account(email, password) VALUES (?)`;

    let values = [req.body.email, md5(req.body.password)];

    conn.query(sql, [values], (err, results) => {
      res.send(JSON.stringify({ error: err, response: results }));
    });
  } catch (error) {
    return error.message;
  }
});
/****  END CRUD ACCOUNT*****/

//Test Cloud Build
app.get("/api/accounts", (req, res) => {
  let sql = "SELECT * FROM account";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//Server listening
var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(
    "Server started on port 5000... " + "DB HOST : " + process.env.DB_HOST
  );
});
