//Author: Justin Steinberg
//Using Express Framework
const express = require("express");
const fetch = require("node-fetch");
const app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017'
const dbName = 'test'
let db

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so you can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)

  db.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection 'users' created!!!");
    //db.close();
  });

});



app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.use(express.static("public"));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});


app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym;
	console.log(sym);
	const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
	const fetch_response = await fetch(api_url)
	const json = await fetch_response.json();
	res.json(json);
});

app.post('/login', function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    //console.log("Username: " + username);
    //console.log("Password: " + password);
    res.send('/public/app.html');

    var doc = { username: "mramer01", password: "password" };


    db.collection("users").insertOne(doc, function(err, res) {
        if (err) throw err;
        console.log(doc);
        // close the connection to db when you are done with it
        //db.close();
    });
});

app.get('/login_suc', function(req, res){
    res.send(path.join(__dirname + '/public/app.html'));
})



