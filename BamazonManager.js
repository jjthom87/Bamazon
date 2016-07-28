var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Ntho1mas",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err) {
		throw err 
	}
});

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
		console.log(" ");
	} else if (res.choose === 'Add New Product') {
		addProduct();
	}
})

function viewProducts() {
	connection.query('SELECT * FROM Products', function(err, res){
		if (err) {
			throw err
		}
		res.forEach(function(column){
			console.log("-------------------------");
			console.log("Item ID: " + column.id);
			console.log("Item: " + column.ProductName);
			console.log("Price: $" + column.Price);
			console.log(column.StockQuantity + " in Stock");
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
	})
};

function addToInventory() {
	connection.query('SELECT * FROM Products', function(err, results){
		if (err) {
			throw err
		}
			inquirer.prompt([{
				type: "list",
				message: "What product would you like to add inventory to?",
				choices: ['Mulberries' , 'Blueberries', 'Jareberries', 'Blackberries', 'Strawberries', 'Kale', 'Super Kale', 'Dinosuar Kale', 'Ultra Kale', 'Burger Kale', 'Venison', 'Polar Bear', 'Bengal Tiger', 'Koala Bear', 'Hummingbird'],
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
								console.log("Your quantity has been updated. Please select 'View Products For Sale' to review");
								})
						})	
					}
				}
			})
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
				console.log("The " + results.product + " has been added");
			})
		})
	})
};
