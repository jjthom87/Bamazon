var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require("cli-table");
var events = require('events');
var request = require('request');

var eventEmitter = new events.EventEmitter();

eventEmitter.setMaxListeners(0);

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err) {
		throw err 
	}
});

var table = new Table({ head: ['Product ID', 'Product', 'Department', 'Price', 'Qty in Stock']});

var requestList = [{
	type: "input",
	message: "Welcome. Please type your name",
	name: "name"
},{
	type: "list",
	message: "Please Pick an Option",
	choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
	name: 'choose'
}];

inquirer.prompt(requestList).then(function(res){
	console.log(" ");
	console.log("Welcome " + res.name + ". Your Request Has Been Submitted");
	console.log(" ");
	if(res.choose === 'View Products for Sale') {
		console.log("These are the Items For Sale");
		console.log(" ");
		viewProducts();
	} else if (res.choose === 'View Low Inventory') {
		console.log("These are the Items With Low Inventory");
		console.log(" ")
		viewLowInventory();
	} else if (res.choose === 'Add to Inventory') {
		addToInventory();
	} else if (res.choose === 'Add New Product') {
		addProduct();
	}
});

function viewProducts() {
	connection.query('SELECT MAX(id) FROM Products', function(err, resultz) {
		resultz.forEach(function(columns){
			var chosen = columns['MAX(id)'];
			connection.query('SELECT * FROM Products', function(err, results){
				if (err) {
					throw err;
				}
				for(i=0; i < results.length; i++) {
					table.push(
						[results[i].id, results[i].ProductName, results[i].DepartmentName, results[i].Price, results[i].StockQuantity]
					);
					if (table.length == chosen) {
						console.log(table.toString());
						connection.end();
					}
				};
			})
		})
	})
};

function viewLowInventory() {
	connection.query('SELECT * FROM Products', function(err, res){
		if (err) {
			throw err
		}
		for(i = 0; i < res.length; i++) {
			if (res[i].StockQuantity < 5) {
			console.log("-------------------------");
			console.log("Item ID: " + res[i].id);
			console.log("Item: " + res[i].ProductName);
			console.log("Price: $" + res[i].Price);
			console.log(res[i].StockQuantity + " in Stock");
			}
		}
		connection.end();
	})
};

function addToInventory() {
	connection.query('SELECT * FROM Products', function(err, results){
		if (err) {
			throw err
		}
		for(var i = 0; i < results.length; i++){
			inquirer.prompt([{
				type: "list",
				message: "What product would you like to add inventory to?",
				choices: request(function(products){
					var productArray = [];
					for (var i = 0; i < results.length; i++){
						productArray.push(results[i].ProductName)
					}
					return productArray.setMaxListeners(0);
				}).setMaxListeners(0),
				name: "addList"
			}]).then(function(res){
				for(var i=0 ; i < results.length; i++){
					if (results[i].ProductName === res.addList) {
						var chosenProduct = results[i];
						inquirer.prompt([{
							type: 'input',
							message: 'How much would you like to add?',
							name: 'quantity'
						}]).then(function(rez){
							connection.query('UPDATE Products SET ? WHERE ?',[{
								StockQuantity: (parseFloat(rez.quantity) + parseFloat(chosenProduct.StockQuantity))}, {ProductName: res.addList}],
								function(err, ress){
									if (err) {
										throw err
									}
								console.log(" ");
								console.log("Your quantity has been updated. Please select 'View Products For Sale' to review.");
								connection.end();
								})
							})	
						}
					}
				})
			}
		})
};


function addProduct(){
	connection.query('SELECT * FROM Products', function(err, results){
		if (err) {
			throw err
		}
		inquirer.prompt([{
			type: "input",
			message: "What is the name of the product",
			name: "product"
		},{
			type: "input",
			message: "What department would you classify this product under?",
			name: "department"
		},{
			type: "input",
			message: "What is the price of your product?",
			name: "price"
		},{
			type: "input",
			message: "How much are you adding?",
			name: "quantity"
		}]).then(function(results){
			connection.query('INSERT INTO Products SET ?', {
				ProductName: results.product,
				DepartmentName: results.department,
				Price: results.price,
				StockQuantity: results.quantity
			}, function(err, res){
				if (err) {
					throw err
				}
				console.log(" ");
				console.log("A quantity of " + results.quantity + " for the " + results.product + " has been added")
				connection.end();
			})
		})
	})
};


