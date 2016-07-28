var mysql = require("mysql");
var inquirer = require("inquirer");

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

function searchAndBuy(){
connection.query('SELECT * FROM Products', function(err, results){
	if (err) {
		throw err;
	}
	results.forEach(function(column){
		console.log("--------------------");
		console.log("Product ID: ", column.id);
		console.log("Item: ", column.ProductName);
		console.log("Department: ", column.DepartmentName);
		console.log("Price: $" + column.Price);
		console.log("Stock: ", column.StockQuantity);
			})
	inquirer.prompt(idQuestion).then(function(answer){
		for(var i=0; i < results.length; i++) {
			if(results[i].id == answer.idPick) {
				var chosenItem = results[i];
				inquirer.prompt(quantityQuestion).then(function(answer2){
					if (chosenItem.StockQuantity > answer2.quantityPick) {
						console.log("We have enough in stock. Your order has been placed");
						connection.query("UPDATE Products SET ? WHERE ?",[{
						StockQuantity: chosenItem.StockQuantity - answer2.quantityPick }, {id: answer.idPick}], function(err,res){
							if (err){
								throw err;
								}
							console.log("The Cost of Your Purchase for " + answer2.quantityPick + " " + chosenItem.ProductName + " is $" + (answer2.quantityPick * chosenItem.Price) + ".")
							});
						} else {
						console.log("Not enough in stock. Order can not be placed.");
						}
					})
				}
			}
		})
	})
};
searchAndBuy();