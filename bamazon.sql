DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(40) NOT NULL,
    department_name VARCHAR(40) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(10) NOT NULL,
    PRIMARY KEY (id)

);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Nintendo Switch", "Electronics", 250, 120), ("Levi's Jeans", "Clothing", 55, 90), ("50 Shades of Grey", "Literature", 10.99, 100), ("Yamaha F350", "Musical Instrument", 99.99, 24), ("iMac", "Electronics", 1300, 42), ("Adidas Yeezys Boost", "Clothing", 400, 2), ("Yamaha Piano", "Musical Instrument", 800, 56), ("Slaughterhouse Five", "Literature", 14.99, 59), ("Playstation 4", "Electronics", 250, 100), ("Denim Jacket", "Clothing", 114.99, 45);

