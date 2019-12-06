//Author: Justin Steinberg
//Using Express Framework
const express = require("express");
const fetch = require("node-fetch");
const app = express();
var path = require('path');


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.use(express.static("public"));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app.html'));
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
    const username = req.param.username;
    const password = req.param.password;
    console.log("Username: " +username);
    console.log("Password: " +password);
});