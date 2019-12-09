//Author: Justin Steinberg
//Using Express Framework
const express = require("express");
const fetch = require("node-fetch");
const app = express();
var path = require('path');
var bodyParser = require('body-parser');
var flash    = require('connect-flash');
var session      = require('express-session');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://demo_admin:comp20@democluster-atdke.mongodb.net/test?retryWrites=true&w=majority";
//const url = 'mongodb://127.0.0.1:27017'
const dbName = 'test'
var db
var username;
var counter = 0;

  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)

    // Storing a reference to the database so you can use it later
    db = client.db(dbName)
    console.log(`Connected MongoDB: ${url}`)
    console.log(`Database: ${dbName}`)
  });

app.set('public engine', 'ejs'); // set up ejs for templating;
app.use(flash());
app.use(session({ secret: 'webprogrammingcomp20' }));

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


function checkExists(db, collection, query) {
    return new Promise((resolve, reject) => {
        db.collection(username).find(query, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if (doc && doc.length) //if it does
            {
                //console.log(doc); // print out what it sends back
                resolve(doc);
            }
            else // if it does not 
            {
                console.log("Not in docs");
                resolve(0);
            }
        });
    });
}

app.use(express.static("public"));


app.get('/', function(req, res) {
	req.flash('success');
	res.locals.message = req.flash();
	res.render('login.ejs')
});

app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym;
});

app.post('/stock/:sym', async(req, res) => {
	const sym = req.params.sym;

	console.log(sym);
	const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
	const fetch_response = await fetch(api_url);
	const json = await fetch_response.json();

	res.json(json);
	const quant = req.body['quant'];

	var key = json.symbol;
    var query = {"symbol": key};

    // finds document in username collection
    var doc = checkExists(db, username, query);
    doc.then(function(value) {
        if (value == 0) {
            // inserts new stock if doesn't exist
            db.collection(username).insertOne(
                {
                    "symbol": json.symbol,
                    "latestPrice":  json.latestPrice,
                    "quantity": quant
                }
            );
        }
        else {
            // adds to quantity of stock if exists
            var new_quant = (parseInt(quant) + parseInt(value[0].quantity)).toString(10);
            var myquery = { "symbol": key };
            var newvalues = { $set: {"quantity": new_quant} };
            db.collection(username).updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                else
                    console.log(value[0].symbol + " quantity updated");
            });
        }
    });
});

app.post('/login', function(req,res) {
    username = req.body.username;
/*############Jun - login validation (username and password) -- check if username and password exist ####*/
    const password = req.body.password;


  	console.log("Username: " + username);
	console.log("Password: " + password);

	// validate username and password 
	req.flash('success', 'Registration successfully');
	req.flash('fail', 'Incorrect Username or Password');
	if(username == "app") {
		req.flash('logged_in', 'true')
		req.flash('username', username);
		res.redirect(307, '/app');
	}
	else {
		req.flash('logged_in', 'false')
		res.locals.message = req.flash();
		res.render('login.ejs');
	}

	db.createCollection(username, function(err, collection) {
      //if (err) throw err;
      console.log("Collection '" + username + "' created!!!");
    });

    var user = {"id": counter, "username":username, "password": password, "symbol":""};
    counter++;
    // create new collection for new user
    db.collection(username).insertOne(user, function(err, res) {
        if (err) throw err;
        console.log(user);
    });
});

app.post('/app', function(req, res) {
	var message = req.flash('logged_in');
	if(message == 'true')
		res.render('app.ejs');
	else
		console.log("fail");
});

app.get('/login_suc', function(req, res) {
	res.render('app.ejs');
});

app.get('/newuser', function(req, res){
	res.render('signup.ejs');
})