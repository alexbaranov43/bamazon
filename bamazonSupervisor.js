var mysql = require("mysql")
var inquire = require("inquirer")
var Table = require("cli-table")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
});

supervisor()
function supervisor() {
    inquire
        .prompt([
            {
                name: "action",
                type: "list",
                message: "Pick Option",
                choices: ["View Product Sales by Department", "Create New Department", "Quit Admin"]
            }
        ]).then(function (answer) {
            switch (answer.action) {
                case "View Product Sales by Department":
                    viewSales();
                    break;

                case "Create New Department":
                    createDepartment();
                    break;

                case "Quit Admin":
                    connection.end();
                    break;
            }
        })
}



function viewSales() {
    var table = new Table({
        head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
        , colWidths: [30, 30, 30, 30, 30]
    });

    connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_id", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            // console.log('\nDepartment ID: ' + res[i].department_id
            // +'\r\nDepartment Name: ' + res[i].department_name
            // +'\r\nOverhead Costs: ' + res[i].over_head_costs
            // +'\r\nProduct Sales: ' + res[i].product_sales
            // +'\r\nTotal Profit: ' + res[i].total_profit
            // )
            // table is an Array, so you can `push`, `unshift`, `splice` and friends 
            table.push(
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit]
            );
        }
        console.log(table.toString());
        supervisor();
    })

}


function createDepartment() {
    inquire
        .prompt([
            {
                name: "department_name",
                type: "input",
                message: "New Department: ",
            },
            {
                name: "over_head_costs",
                type: "input",
                message: "Department Overhead Costs:",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return true
                }
            },
        ]).then(function (answer) {
            connection.query("INSERT INTO `departments`(`department_name`, `over_head_costs`) VALUES (?, ?)", [answer.department_name, answer.over_head_costs], function (err, val) {
                if (err) throw err;
                console.log(answer.department_name + " was added")
                function addProduct() {
                    inquire
                        .prompt([
                            {
                                name: "product_name",
                                type: "input",
                                message: "Enter new product to the department:"
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
                        ]).then(function (answers) {
                            connection.query("INSERT INTO `products`(`product_name`, `department_name`, `price`, `stock_quantity`) VALUES (?, ?, ?, ?)", [answers.product_name, answer.department_name, answers.price, answers.stock_quantity], function (err, val) {
                                if (err) throw err;
                                inquire.prompt([
                                    {
                                        name: "action",
                                        type: "list",
                                        message: "Would you like to add another item to this department?",
                                        choices: ["Yes", "No"]
                                    }
                                ]).then(function(answer){
                                    switch(answer.action){
                                        case "Yes":
                                        addProduct();
                                        break;

                                        case "No":
                                        supervisor();
                                        break;
                                    }
                                })
                                
                            })
                        })
                }
                addProduct();
            })
        })
}

