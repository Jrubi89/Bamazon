var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon_db",
  port: 3306
});
connection.connect();

function displayProducts() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("");
    console.log("Complete Inventory List");
    console.log("");

    var table = new Table({
      head: ["Product id", "Product Desc", "Cost", "Stock"],
      colWidths: [12, 50, 8, 8],
      colAligns: ["center", "left", "right"],
      style: {
        head: ["blue"],
        compact: true
      }
    }); //end Table
    for (var i = 0; i < results.length; i++) {
      table.push([
        results[i].id,
        results[i].product_name,
        results[i].price,
        results[i].stock_quantity
      ]);
    }
    console.log(table.toString());
    console.log("");
  });
}
function saleProducts() {
  connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(
    error,
    results
  ) {
    if (error) throw error;
    console.log("");
    console.log("Bamazon Store Inventory");
    console.log("");

    var table = new Table({
      head: ["Product id", "Product Desc", "Cost", "Stock"],
      colWidths: [12, 50, 8, 8],
      colAligns: ["center", "left", "right"],
      style: {
        head: ["blue"],
        compact: true
      }
    }); //end Table
    for (var i = 0; i < results.length; i++) {
      table.push([
        results[i].id,
        results[i].product_name,
        results[i].price,
        results[i].stock_quantity
      ]);
    }
    console.log(table.toString());
    console.log("");
    initialPrompt();
  });
} //end products for sale function
function lowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(
    error,
    results
  ) {
    if (error) throw error;
    console.log("");
    console.log("Low Inventory items");
    console.log("");
    var table = new Table({
      head: ["Product Id", "Product Description", "Cost", "Stock"],
      colWidths: [12, 50, 8, 8],
      colAligns: ["center", "left", "right", "center"],
      style: {
        head: ["blue"],
        compact: true
      }
    }); //end table
    for (var i = 0; i < results.length; i++) {
      table.push([
        results[i].id,
        results[i].products_name,
        results[i].price,
        results[i].stock_quantity
      ]);
    }
    console.log(table.toString());
    console.log("");
    initialPrompt();
  });
}
function addInventory() {
  inquirer
    .prompt({
      name: "item",
      type: "input",
      message: "What is the id number of the productinventory for? "
    })
    .then(function(answer1) {
      var selection = answer1.item;
      connection.query("SELECT * FROM products WHERE id=?", selection, function(
        err,
        res
      ) {
        if (err) throw err;
        if (res.length === 0) {
          console.log("That product doesn't exsist");
          addInventory();
        } else {
          inquirer
            .prompt({
              name: "quantity",
              type: "input",
              message: "How many items do you want to add to the inventory?"
            })
            .then(function(answer2) {
              var quantity = answer2.quantity;
              if (quantity < 0) {
                console.log("Please enter a number higer than 0");
                addInventory();
              } else {
                console.log("");
                connection.query(
                  "UPDATE products SET stock_quantity = " +
                    quantity +
                    " WHERE id = " +
                    res[0].id,
                  function(err, resUpdate) {
                    if (err) throw err;
                    console.log("");
                    console.log("Quantity has been updated");
                    console.log(
                      quantity + "items added to " + res[0].products_name
                    );
                    console.log("");
                    initialPrompt();
                  }
                );
              }
            });
        }
      });
    });
}
function addNewProduct() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Please enter the name of the product you wish to add"
      },
      {
        type: "input",
        name: "department",
        message: "What department does this item belong to?"
      },
      {
        type: "input",
        name: "price",
        message: "Please enter the price of the item?"
      },
      {
        type: "input",
        name: "stock",
        message: "Please enter a stock quantity for this item"
      }
    ])
    .then(function(data) {
      var name = data.name;
      var department = data.department;
      var price = data.price;
      var stock = data.stock;
      connection.query(
        "INSERT INTO products SET ?",
        {
          products_name: name,
          department_id: department,
          price: price,
          stock_quantity: stock
        },
        function(err, insertResult) {
          if (err) console.log("Error: " + err);
          console.log("");
          console.log("New product " + name + " has been added");
          console.log("");
          initialPrompt();
        }
      );
    });
}
function viewDepartments() {
  connection.query("SELECT * FROM departments", function(error, results) {
    if (error) throw error;
    console.log("");
    console.log("Departments List");
    console.log("");
    var table = new Table({
      head: ["Depart. Id", "Description", "OH Cost"],
      colWidths: [14, 45, 12],
      colAligns: ["center", "left", "right"],
      style: {
        head: ["blue"],
        compact: true
      }
    }); //end table
    for (var i = 0; i < results.length; i++) {
      table.push([
        results[i].id,
        results[i].department_name,
        results[i].over_head_costs
      ]);
    }
    console.log(table.toString());
    console.log("");
    initialPrompt();
  });
}
function initialPrompt() {
  inquirer
    .prompt({
      name: "selection",
      type: "rawlist",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "View Departments",
        "Add to Inventory",
        "Add New Product",
        "Exit"
      ],
      message: "Select one of the following options: ",
      default: "Number"
    })
    .then(function(answer) {
      console.log("ok");
    });
}
initialPrompt();