// server.js

//---------------------------------------
//---------------------------------------
// Main dependencies
//---------------------------------------
//---------------------------------------
const express = require('express');
const rp = require('request-promise');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 8888;
var cors = require('cors')

//---------------------------------------
// set the view engine to ejs
//---------------------------------------
app.set('view engine', 'ejs');

app.use(cors())

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
app.get('/people', (req, res) => {
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
			res.json(results);
			// sortByName = false;
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


//
// Extract name from residents
//
function extractNames(param) {
	return Promise.all(
		param.map(residentUri => {
			return rp({
				uri: residentUri,
				json: true
			})
		})
	).then(residents => {
		const residentNames = residents.map(resident => {
			return resident.name
		})
		return residentNames;
	}).catch (err => {
		console.log(err);
	})
}

function getPlanets(planets) {
	const result = {};
	return Promise.all(
		planets.map(planet => {
			const planetProcessed = planet;
			return extractNames(planetProcessed.residents)
				.then(residentNames => {
					result[planet.name] = residentNames
				})
		})
	)
		.then(() => {
			return result;
		})
}

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
			getPlanets(planets)
				.then(p => {
					res.render('pages/planetresidents', {
						data: JSON.stringify(p)
					});
				});

		})
		.catch((err) => {
			console.log(err);
		})
});


//---------------------------------------
// set up port listener
//---------------------------------------
app.listen(port, function () {
	console.log('CORS-enabled web server listening on port 80')
})
console.log('8888 is the magic port');


