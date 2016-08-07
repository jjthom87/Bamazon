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
					var chosenItem = results[i];
					inquirer.prompt(quantityQuestion).then(function(answer2){
						if (chosenItem.StockQuantity > answer2.quantityPick) {
							var sale = (answer2.quantityPick * chosenItem.Price);
							console.log("We have enough in stock. Your order has been placed");
							connection.query("UPDATE Products SET ? WHERE ?",[{
							StockQuantity: chosenItem.StockQuantity - answer2.quantityPick }, {id: answer.idPick}], function(err,res){
								if (err){
									throw err;
									}
								console.log("The Cost of Your Purchase for " + answer2.quantityPick + " " + chosenItem.ProductName + " is $" + sale + ".")
								console.log("Thank You for Shopping.")
								connection.query("SELECT * FROM Departments", function(err,resi){
									if (err) {
										throw err
									}
									for (var i = 0; i < resi.length; i++){
										var totalSaleVar = resi[i];
										connection.query("UPDATE Departments SET ? WHERE ?",[{
											TotalSales: sale + totalSaleVar.TotalSales},{DepartmentName: chosenItem.DepartmentName}
										], function(err, reso){
											if (err){
												throw err
											}
										})
									}
							connection.end();
								});
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