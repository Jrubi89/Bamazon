var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require('chalk');
var Table = require("cli-table2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pe@ches21489",
  database: "bamazon_db",
  port: 3306
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connection successful');
    // display all items from database once mysql connection has been established
    resetData();
    displayMenu();
});

// GLOBAL VARIABLES
// =====================================================================================
var itemToUpdate = {};
var itemToDelete = {};

// FUNCTIONS
// =====================================================================================
var resetData = function() {
    itemToUpdate = {};
    itemToDelete = {};
}

var displayMenu = function() {
    inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: '\n\nChoose an action:',
        choices: [
            'View Product for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
            'Remove A Product'
        ]
    }).then((answer) => {
        switch (answer.action) {
            case 'View Product for Sale':
                viewActiveProduct();
            break;
            case 'View Low Inventory':
                viewLowInventory();
            break;
            case 'Add to Inventory':
                addToInventory();
            break;
            case 'Add New Product':
                addNewProduct();
            break;
            case 'Remove A Product':
                deleteProduct();
            break;
        }
    });
};

var viewActiveProduct = function() {
    connection.query(`SELECT * FROM product`, (err, res) => {
        var listTable = new Table({
            head: ["Product Id", "Product Description","Quantity", "Price"],
            colWidths: [20, 45, 10, 12],
            colAligns: ["center", "center", "center", "center"],
        });

        for (var i = 0; i < res.length; i++) {
            listTable.push([res[i].id, res[i].product_name, res[i].stock_quantity, `$${res[i].price}`]);
            // console.log(chalk.blue.bold(`\n\tItem ID: ${res[i].item_id}\n\tProduct Name: ${res[i].product_name}\n\tPrice: $${res[i].price}\n`));
        }

        console.log(`\n\n${listTable.toString()}\n\n`);
        connection.end();
    });
};

var viewLowInventory = function() {
    connection.query(`SELECT * FROM product WHERE stock_quantity < 5 ORDER BY stock_quantity DESC`, (err, res) => {
        if (res.length > 0) {
            var listTable = new Table({
                head: ["Product Id", "Product Description","Quantity", "Price"],
                colWidths: [20, 45, 10, 12],
                colAligns: ["center", "center", "center", "center"],
            });

            for (var i = 0; i < res.length; i++) {
                listTable.push([res[i].id, res[i].product_name, res[i].stock_quantity, `$${res[i].price}`]);
                // console.log(chalk.blue.bold(`\n\tItem ID: ${res[i].item_id}\n\tProduct Name: ${res[i].product_name}\n\tPrice: $${res[i].price}\n`));
            }

            console.log(`\n\n${listTable.toString()}\n\n`);

        } else {
            console.log(chalk.blue.bold('\n\tNo low-stock items!\n'));
        }
        connection.end();
    });
};

var addToInventory = function() {
    askForID();
};

var addNewProduct = function() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter the product name:'
        },
        {
            name: 'department',
            type: 'input',
            message: 'Enter the product department:'
        },
        {
            name: 'price',
            type: 'input',
            message: 'Enter the product price:',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.red(` => Oops, please enter a number greater than 0`));
                    return false;
                }
            }
        }, 
        {
            name: 'stockNum',
            type: 'input',
            message: 'Enter the number of items in stock:',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.red(` => Oops, please enter a number greater than 0`));
                    return false;
                }
            }
        }
    ]).then((answers) => {
        connection.query('INSERT INTO product SET ?', {
            product_name: answers.name,
            deparment_id: answers.department,
            price: answers.price,
            stock_quantity: answers.stockNum
        }, (err, res) => {
            if (err) throw err;
            console.log(chalk.blue.bold('\n\tItem successfully added!'));
            viewActiveProduct();
        });
    });
};

var deleteProduct = function() {
    inquirer.prompt({
        name: 'ID',
        type: 'input',
        message: 'Enter the ID of the product you\'d like to remove:'
    }).then((answer) => {
        connection.query('SELECT * FROM product WHERE ?', { id: answer.ID }, (err, res) => {
            inquirer.prompt({
                name: 'confirm',
                type: 'confirm',
                message: `You would like to delete` + chalk.blue.bold(` '${res[0].product_name}'. `) + `Is this correct?`
            }).then((answer) => {
                if (answer.confirm) {
                    itemToDelete = {
                        id: res[0].id
                    };
                    connection.query('DELETE FROM product WHERE ?', { id: itemToDelete.id }, (err, res) => {
                        if (err) throw err;
                        console.log(chalk.blue.bold('\n\tItem successfully removed!'));
                        viewActiveProduct();
                    });
                } else {
                    deleteProduct();
                }
            });
        });
    });
};

var askForID = function() {
    inquirer.prompt({
        name: 'ID',
        type: 'input',
        message: 'Enter the ID of the item you\'d like to update:',
        // validate input is number from 1-10
        validate: (value) => {
            if (!isNaN(value) && (value > 0 && value <= 10)) {
                return true;
            } else {
                console.log(chalk.red(' => Please enter a number from 1-10'));
                return false;
            }
        }
        // select all rows where ID = user's input
    }).then((answer) => {
        connection.query('SELECT * FROM product WHERE ?', { id: answer.ID }, (err, res) => {
            confirmItem(res[0].product_name, res);
        });
    });
};

var confirmItem = function(product, object) {
    inquirer.prompt({
        name: 'confirmItem',
        type: 'confirm',
        message: `You chose` + chalk.blue.bold(` '${product}'. `) + `Is this correct?`
    }).then((answer) => {
        if (answer.confirmItem) {
            itemToUpdate = {
                id: object[0].id,
                product_name: object[0].product_name,
                deparment_id: object[0].deparment_id,
                price: object[0].price,
                stock_quantity: object[0].stock_quantity,
                product_sales: object[0].product_sales
            };
            askHowMany();
        } else {
            askForID();
        }
    });
};

var askHowMany = function() {
    inquirer.prompt({
        name: 'howMany',
        type: 'input',
        message: 'Enter the quantity you would like to add:',
        validate: (value) => {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log(chalk.red(' => Oops, please enter a number greater than 0'));
                return false;
            }
        }
    }).then((answer) => {
        itemToUpdate.howMany = answer.howMany;
        connection.query('UPDATE product SET ? WHERE ?', [
            {
                stock_quantity: Number(itemToUpdate.stock_quantity) + Number(answer.howMany)
            },
            {
                id: itemToUpdate.id
            }
        ], (err, res) => {
            console.log(chalk.blue.bold(`\n\tInventory updated! '${itemToUpdate.product_name}' now has ${Number(itemToUpdate.stock_quantity) + Number(itemToUpdate.howMany)} items in stock\n`));
            connection.end();
        });
    });
}