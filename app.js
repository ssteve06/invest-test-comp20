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
app.set('public engine', 'ejs'); // set up ejs for templating;
app.use(flash());
app.use(session({ secret: 'webprogrammingcomp20' }));

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.use(express.static("public"));

var signupMessage = "helllooelreol"

app.get('/', function(req, res) {
	req.flash('success');
	res.locals.message = req.flash();
	res.render('login.ejs')
});

app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym; 
	console.log(sym);
	const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
	const fetch_response = await fetch(api_url);
	const json = await fetch_response.json();
	res.json(json);
});

app.post('/login', function(req,res){
	const username = req.body.username;
    const password = req.body.password;
    console.log("Username: " + username);
	console.log("Password: " + password);
	
	// validate username and password 
	req.flash('success', 'Registration successfully');
	req.flash('fail', 'Incorrect Username or Password')
	res.locals.message = req.flash();
	if(true && false){
		res.render('app.ejs');
	}
	else{
		res.render('login.ejs');
	}

});

app.get('/login_suc', function(req, res){
	res.render('app.ejs')
})