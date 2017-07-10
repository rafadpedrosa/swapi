// server.js

//---------------------------------------
//---------------------------------------
// Main dependencies
//---------------------------------------
//---------------------------------------
const express = require('express');
const rp = require('request-promise');
const app = express();
const async = require('async');

//---------------------------------------
// set the view engine to ejs
//---------------------------------------
app.set('view engine', 'ejs');


//---------------------------------------
// compare and sort API responses
//---------------------------------------
function sortStrings(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}
// https://stackoverflow.com/questions/19259233/sorting-json-by-specific-element-alphabetically

function sortNumber(a,b) {
    return a - b;
}
//https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly

//---------------------------------------
// create route for index page
//---------------------------------------
app.get('/', function(req, res) {
    let tagline = "Learn more about the Star Wars universe";
	res.render('pages/index', {
		tagline: tagline
	});
});

 
//-----------------------------------------------
// create route for characters page - limit to 50
//-----------------------------------------------
app.get('/characters', (req, res) => {
	console.log(req.query.sort);
	//https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
	rp({
		uri: 'https://swapi.co/api/people/',
	  	json: true
	})
	.then((data) => {
		let parsedQuery = req.query.sort;
		let results = data.results;
		if (parsedQuery === 'name') {
			results.sort(function(a, b) {
			  return sortStrings(a.name, b.name);
			})
		}
		if (parsedQuery === 'mass') {
			results.sort(function(a, b) {
			  return sortNumber(a.mass, b.mass);
			})
		}
		if (parsedQuery === 'height') {
			results.sort(function(a, b) {
			  return sortNumber(a.height, b.height);
			})
		}
		res.render('pages/characters', {
			data: results
		});
		sortByName = false;
	})
	.catch((err) => {
		// Deal with the error
		console.log(err);
	})
});




//------------------------------------------------
// create route for specific character by NAME
//------------------------------------------------
app.get('/character/:name', (req, res) => {
	rp({
		uri: `https://swapi.co/api/people/?search=${req.params.name}`,
	  	json: true
	})
	.then((data) => {
		res.render('pages/character', {
			data: data.results
		});
	})
	.catch((err) => {
		// Deal with the error
		console.log(err);
	})
});



//-------------------------------------------------------
// create route for planetresidents page - raw json
//-------------------------------------------------------
app.get('/planetresidents', (req, res, next)  => {
	rp({
		uri: 'http://swapi.co/api/planets/',
	  	json: true
	})
	.then((data) => {
		let planets = data.results;
		let planet = '';
		let residentsObject = {};
		planets.forEach(function(planet) {
			let key;
			let value = '';
			let residents = new Array();
			let resident = '';
			let planetResidentsUri = '';
			key = planet.name;
			residentsObject[key] = [];
			planetResidentsUri = planet.residents;
			planetResidentsUri.forEach(function(residentUri) {
				rp({
					uri: residentUri,
				  	json: true
				})
				.then((data) => {
					resident = data.name;	
					residents.push(resident)
				})
				.then((data) => {
					//console.log(residents);
					Object.assign(residentsObject[key],residents);
				})
				.catch((err) => {
					console.log(err);
				})
			});
			
			//console.log(residentsObject);
			return residentsObject;
		});
		let newObject = JSON.stringify(residentsObject);
		res.render('pages/planetresidents', {
			data: newObject
		});
	})
	.catch((err) => {
		console.log("stuff", err);
	})
});


//---------------------------------------
// set up port listener
//---------------------------------------
app.listen(8088);
console.log('8088 is the magic port');


