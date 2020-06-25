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
    console.log("-----------------------------------------------------------");
    console.log("                   Welcome To Bamazon                      ");
    console.log("-----------------------------------------------------------");
    console.log("");
    console.log("                 Find below our Product List               ");
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
//for loop will use the length of the result to push the prosuct name and price//
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].product_name, res[i].price]);
    }
//Console log table//
    console.log(table.toString());
    console.log("");
    shopping();
  }); //End Connection to product//
};
//Shopping variable//
var shopping = function() {
  inquirer
    .prompt({
      name: "productToBuy",
      type: "input",
      message: "Please enter the Product Id of the item you wish to purchase.!"
    })
    .then(function(answer1) {
      var selection = answer1.productToBuy;
      connection.query("SELECT * FROM product WHERE Id=?", selection, function(
        err,
        res
      ) {
        if (err) throw err;
        if (res.length === 0) {
          console.log(
            "That Product doesn't exist, Please enter a Product Id from the list above"
          );

          shopping();
        } else {
          inquirer
            .prompt({
              name: "quantity",
              type: "input",
              message: "How many items woul you like to purchase?"
            })
            .then(function(answer2) {
              var quantity = answer2.quantity;
              if (quantity > res[0].stock_quantity) {
                console.log(
                  "Our Apologies we only have " +
                    res[0].stock_quantity +
                    " items of the product selected"
                );
                shopping();
              } else {
                console.log("");
                console.log(res[0].product_name + " purchased");
                console.log(quantity + " qty @ $" + res[0].price);

                var newQuantity = res[0].stock_quantity - quantity;
                connection.query(
                  "UPDATE product SET stock_quantity = " +
                    newQuantity +
                    " WHERE id = " +
                    res[0].id,
                  function(err, resUpdate) {
                    if (err) throw err;
                    console.log("");
                    console.log("Your Order has been Processed");
                    console.log("Thank you for Shopping with us...!");
                    console.log("");
                    connection.end();
                  }
                );
              }
            });
        }
      });
    });
};

display();


