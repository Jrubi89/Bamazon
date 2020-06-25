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
//Calling connection//
connection.connect();
//Variable to display table//
var display = function() {
  //Using query to connect to data base//
  connection.query("SELECT * FROM product", function(err, res) {
    if (err) throw err;
    console.log("-----------------------------");
    console.log("      Welcome To Bamazon    ");
    console.log("-----------------------------");
    console.log("");
    console.log("Find below our Products List");
    console.log("");
//Creating a table that will connect the cli-table//     
    var table = new Table({
      head: ["Product Id", "Product Description", "Price"],
      colWidths: [12, 30, 10],
      colAligns: ["center", "center", "center"],
      style: {
        head: ["aqua"],
        compact: true
        // 'padding-right' : 1,
      }
    });
