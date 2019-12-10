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
//const url = "mongodb+srv://comp20admin:comp20admin@comp20-winrz.mongodb.net/test?retryWrites=true&w=majority";

//const url = 'mongodb://127.0.0.1:27017'
const dbName = 'test'
var db
var username;

/*const APIKey = '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';
const sgMail = require('@sendgrid/mail'); // MUST MAKE ENVIRONMENT VARIABLES WHEN DEPLOYING ON HEROKU
sgMail.setApiKey(APIKey);*/


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

app.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


function checkExists(db, collection, query) {
    return new Promise((resolve, reject) => {
        db.collection(collection).find(query, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if (doc && doc.length) //if it does
                resolve(doc);
            else // if it does not 
                resolve(0);
        });
    });
}

app.use(express.static("public"));

app.get('/', function(req, res) {
	req.flash('logged_in', 'N/A');
	res.locals.message = req.flash();
	res.render('login.ejs')
});

app.get('/login', function(req,res){
    req.flash('logged_in', 'failed')
    res.locals.message = req.flash();
	res.render('login.ejs')
})

app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym;
    console.log("stock db get request");
});

app.post('/stock/:sym', async(req, res) => {
    const sym = req.params.sym;
    const username = req.body['username'];
    console.log(username)

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
                    "data" : Date.now(),
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
            });
        }
    });
});

app.post('/login', function(req,res) {
    const username = req.body.username;
/*############Jun - login validation (username and password) -- check if username and password exist ####*/
    const password = req.body.password;

    console.log("Username: " + username);
    console.log("Password: " + password);

    var exists = false;
    //var err= db.listCollections().toArray().err;
    db.listCollections().toArray(function(err, collInfos){
    var exists = false;
    // only sends user to main page when password and username is correct
    // DOES NOT yet display "invalid username and password" when incorrect
    for (i = 0; i < collInfos.length && !exists; i++) {
        if (collInfos[i].name == username) {
            var query = {"password": password};
            var doc = checkExists(db, username, query);
            var doc_bool = doc.then(function(value) {
                var exists = false;
                if (value != 0 && value[0].password == password) {
                    req.flash('logged_in', 'true')
                    req.flash('username', username);
                    res.redirect(307, '/app')
                   // console.log("password correct");
                }
                else{
                   // console.log("pass incorrect")
                    req.flash('logged_in', 'failed')
                    res.locals.message = req.flash();
                    res.render('login.ejs');
                    exists = true;
                }
                return exists;
            });
            if(doc_bool)
                exists = true;
        }
    }
    if(!doc_bool){ // username wrong 
        req.flash('logged_in', 'failed')
        res.redirect('/login')
        return;
    }
    })
})

app.post('/app', function(req, res) {
    var message = req.flash('logged_in');
    var username = req.flash('username');
    req.flash('username', username);
    console.log("post app username: " + username)
    if(message == 'true'){
        res.locals.message = req.flash();
        res.render('app.ejs');
    }
	else
		console.log("fail");
});

app.get('/signup', function(req, res) {
    req.flash();
    res.locals.message = req.flash();
	res.render('signup.ejs');
});

app.post('/forgotpassword', function (req, res) {
    const username = req.body.username;
/*    var query = {"username": username};
    var doc = checkExists(db, username, query);
    doc.then(function(value) {
        var email = value[0].email;
        var password = value[0].password;
        const msg = {
            to: email,
            from: 'comp20investing@gmail.com',
            subject: 'Stock Investment Simulator Forgot Password',
            text: 'text',
            html: 'Here is your account information:\n\tUsername: ' + username + '\n\tPassword: ' + password,
        };
        sgMail.send(msg);
    });*/
    res.redirect(307, '/login');
});

app.post('/newuser', function(req,res) {
    var counter = 0;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    var user = {"id": counter, "username": username, "password": password, "email": email, "symbol":""};
    counter++;
    // create new collection for new user
    var exists;
    if(username != '') {
        query = {"username":username}
        exists = checkExists(db, username, query);
    }
    else {
        exists = new Promise(function(resolve, reject){
            resolve(1);
        })
    }
    exists.then(function(value) {
        if(value == 0){
            console.log("adding new user");
            db.createCollection(username, function(err, collection) {
                console.log("new user " + username + " created!!!");
            });
            db.collection(username).insertOne(user, function(err, res) {});
            req.flash("logged_in", 'true');
            req.flash("username", username);
            res.redirect(307, '/app');
        }
        else {
            req.flash('taken', 'true');
            res.locals.message = req.flash()
            res.render('signup.ejs');
        }
    })
});

