var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Ntho1mas",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err)
		throw err;
});

var idQuestion = [{
	type: "input",
	message: "Please input Product ID of your choice",
	name: "idPick"
}];

var quantityQuestion = [{
	type: "input",
	message: "How much would you like to buy?",
	name: "quantityPick"
}];

var table = new Table({ head: ['Product ID', 'Product', 'Department', 'Price', 'Qty in Stock']});

function Buyer(){
	this.sale = '';
	this.chosenItem = '';
}

var newBuyer = new Buyer();

function displayData(){
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
					}
				};
				searchAndBuy();
			})
		})
	})
};
displayData();

function searchAndBuy(){
	connection.query('SELECT * FROM Products', function(err, results){
		if (err) {
			throw err;
		}
		inquirer.prompt(idQuestion).then(function(answer){
			for(var i=0; i < results.length; i++) {
				if(results[i].id == answer.idPick) {
					newBuyer.chosenItem = results[i];
					inquirer.prompt(quantityQuestion).then(function(answer2){
						if (newBuyer.chosenItem.StockQuantity > answer2.quantityPick) {
							newBuyer.sale = (answer2.quantityPick * newBuyer.chosenItem.Price);
							console.log("We have enough in stock. Your order has been placed");
							connection.query("UPDATE Products SET ? WHERE ?",[{
							StockQuantity: newBuyer.chosenItem.StockQuantity - answer2.quantityPick }, {id: answer.idPick}], function(err,res){
								if (err){
									throw err;
									}
								console.log("The Cost of Your Purchase for " + answer2.quantityPick + " " + newBuyer.chosenItem.ProductName + " is $" + newBuyer.sale + ".")
								console.log("Thank You for Shopping.");
								updateSales();
							});
						} else {
							console.log("Not enough in stock. Order can not be placed.");
							console.log("Please check again soon.")
							connection.end();
						}
					})
				}
			}
		})
	})
};

function updateSales(){
	connection.query("SELECT * FROM Departments WHERE ?", {DepartmentName: newBuyer.chosenItem.DepartmentName}, function(err,resi){
		if (err) {
			throw err
		}
		var parsedSale = parseInt(newBuyer.sale);
		var parsedTotal = parseInt(resi[0].TotalSales);
			connection.query("UPDATE Departments SET ? WHERE ?",[{TotalSales: parsedSale + parsedTotal},{DepartmentName: newBuyer.chosenItem.DepartmentName}], 
			function(err, reso){
				if (err){
					throw err
				}
				connection.end();
			})
	});
}