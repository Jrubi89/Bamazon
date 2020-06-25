//Conencting require packages//
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");
//Connection variable to connect to sql database//
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pe@ches21489",
  database: "bamazon_db",
  port: 3306
});
