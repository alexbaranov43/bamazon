var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var productsArray = [];


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    pushItems();
});


function showItems() {
    var table = new Table({
        head: ['ID', 'Product_Name', 'Department', 'Price', 'Stock_Quantity']
        ,colWidths: [30, 30, 30, 30, 30]
    });
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("Welcome to Bamazon! Here is our current inventory.")
        for (i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        //     console.log('\nID: ' + res[i].id
        //         + '\r\nProduct: ' + res[i].product_name
        //         + '\r\nDepartment: ' + res[i].department_name
        //         + '\r\nPrice: $' + res[i].price
        //         + '\r\nStock: ' + res[i].stock_quantity)
        }
        console.log(table.toString());
        buy();
    })
}
showItems();

function pushItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (i = 0; i < res.length; i++) {
            productsArray.push(res[i].id)
        }
    })
}


// showItems();


function buy() {
    inquirer
        .prompt([
            {
                name: "action",
                type: "list",
                message: "Would you like to continue shopping?",
                choices: ["yes", "no"],
            }
        ])
        .then(function (answer) {
            switch (answer.action) {
                case "yes":
                    selectItem();
                    break;

                case "no":
                    console.log("Thank you for shopping with us, have a nice day.")
                    connection.end();
                    break;
            }
        })
}

function selectItem() {
    inquirer
        .prompt([
            {
                name: "id",
                type: "input",
                message: "Please enter the id number of the item you wish to buy: ID",
                validate: function (value) {
                    if (isNaN(value) === false && parseInt(value) <= productsArray.length) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            // console.log(answer)
            connection.query("SELECT * FROM `products` WHERE ?", answer, function (err, res) {
                if (err) throw err;
                console.log("\r\nID: " + res[0].id
                    + "\r\nProduct: " + res[0].product_name
                    + "\r\nPrice: $" + res[0].price
                    + "\r\nStock: " + res[0].stock_quantity)
                inquirer.prompt([
                    {
                        name: "stock_quantity",
                        type: "input",
                        message: "How many of that item would you like to purchase?",
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) <= res[0].stock_quantity) {
                                return true;
                            }
                            return false;

                        }
                    }
                ]).then(function (answers) {
                    // console.log(answer);
                    // console.log(answers)
                    var val = parseInt(res[0].stock_quantity) - parseInt(answers.stock_quantity)
                    var cost = res[0].price * answers.stock_quantity
                    var productSales = parseInt(res[0].product_sales) + parseInt(cost)
                    // console.log(val)
                    connection.query("UPDATE `products` SET stock_quantity = ? WHERE ?", [val, answer], function (err, res) {
                        if (err) throw err;
                        // console.log("You have " + val + " units left of that item.") 
                        console.log("Yor total was $" + cost.toFixed(2) + ", thank you for shopping with us!")

                        connection.query("UPDATE `products` SET product_sales = ? WHERE ?", [productSales, answer], function (err, res) {
                            if (err) throw err;

                        })
                        buy();

                    })

                })
            })
        })
}



