var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

function displayExec(){
	connection.query("SELECT * FROM Departments", function(erri,resi){
		if (erri) {
			throw err
		}
		for (var i = 0; i < resi.length; i++){
			console.log(resi[i]);
		}
		connection.end();
	});
}
displayExec();
