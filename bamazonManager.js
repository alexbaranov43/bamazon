var mysql = require("mysql")
var inquirer = require("inquirer")
var productsArray = [];
var departmentsArray = [];

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

manager();
function manager() {
    console.log("Bamazon Manager")

    inquirer
        .prompt([
            {
                name: "action",
                type: "list",
                message: "Select your action",
                choices: [
                    "View Products For Sale",
                    "View Low Inventory",
                    "Add To Inventory",
                    "Add New Product"]
            }
        ]).then(function (answer) {
            switch (answer.action) {
                case "View Products For Sale":
                    viewProducts();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add To Inventory":
                    addInventory();
                    break;

                case "Add New Product":
                    addNewItem();
                    break;
            }
        })
}

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("Current Inventory.")
        for (i = 0; i < res.length; i++) {
            console.log('\nID: ' + res[i].id
                + '\r\nProduct: ' + res[i].product_name
                + '\r\nDepartment: ' + res[i].department_name
                + '\r\nPrice: $' + res[i].price
                + '\r\nStock: ' + res[i].stock_quantity)
        }
        continuePrompt();
    })
}


function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <=5", function (err, res) {
        if (err) throw err;
        console.log("Low Inventory")
        for (i = 0; i < res.length; i++) {
            console.log('\nID: ' + res[i].id
                + '\r\nProduct: ' + res[i].product_name
                + '\r\nDepartment: ' + res[i].department_name
                + '\r\nPrice: $' + res[i].price
                + '\r\nStock: ' + res[i].stock_quantity)
        }
        continuePrompt();
    })
}

function addInventory() {

    inquirer
        .prompt([
            {
                name: "id",
                type: "input",
                message: "What ID inventory would you like to add to?",
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
                inquirer
                    .prompt([
                        {
                            name: "stock_quantity",
                            type: "input",
                            message: "How much inventory would you like to add?",
                            validate: function (value) {
                                if (isNaN(value) === false) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    ]).then(function (answers) {

                        var newStock = parseInt(res[0].stock_quantity) + parseInt(answers.stock_quantity);

                        connection.query("UPDATE `products` SET stock_quantity = ? WHERE id=?", [newStock, answer.id], function (err, data) {
                            if (err) throw err;
                            console.log("Stock was successfully updated!" +
                                "\nInventory is now: " + newStock + " units")
                            continuePrompt();
                        })
                    })


            })
        })
}






function continuePrompt() {
    inquirer
        .prompt([
            {
                name: "action",
                type: "list",
                message: "Would you like to continue?",
                choices: ["Yes", "No"]
            }
        ]).then(function (answer) {
            switch (answer.action) {
                case "Yes":
                    manager();
                    break;

                case "No":
                    connection.end();
                    break;

            }
        })
}

function addNewItem() {
    pushDepartments()
    inquirer
        .prompt([
            {
                name: "product_name",
                type: "input",
                message: "Enter the product name:"
            },
            {
                name: "department_name",
                type: "list",
                message: "Select the department",
                choices: departmentsArray
            },
            {
                name: "price",
                type: "input",
                message: "MSRP:",
                validate: function (value) {
                    if (isNaN(value) === false && parseInt(value) > 0) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "stock_quantity",
                type: "input",
                message: "Quantity:",
                validate: function (value) {
                    if (isNaN(value) === false && parseInt(value) > 0) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            connection.query("INSERT INTO `products`(`product_name`, `department_name`, `price`, `stock_quantity`) VALUES (?, ?, ?, ?)", [answer.product_name, answer.department_name, answer.price, answer.stock_quantity], function (err, val) {
                console.log("Congratuations on adding a new item to your inventory!")
                continuePrompt()
            })
        })

}
function pushItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (i = 0; i < res.length; i++) {
            productsArray.push(res[i].id)
        }
    })
}

function pushDepartments() {
    connection.query("SELECT products.department_name FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_id", function (err, res) {
        for (j = 0; j < res.length; j++) {
            departmentsArray.push(res[j].department_name)
        }
    })
}


