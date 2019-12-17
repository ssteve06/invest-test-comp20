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
const dbName = 'test'
var db;
var sandp = [];

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.sgMail_API_KEY);

MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, async (err, client) => {
    if (err) return console.log(err)
    // Storing a reference to the database so you can use it later
    db = await client.db(dbName);
    query = {'id': '1'};
    tempsp = await checkExists(db, 'SandP', query);
    //tempsp = JSON.(tempsp);
    tempsp = tempsp[0]['stocks'];
    for(x in tempsp)
        sandp.push(tempsp[x]['Symbol']);
    console.log(sandp)
})


app.set('public engine', 'ejs'); // set up ejs for templating;
app.use(flash());
app.use(session({ secret: 'webprogrammingcomp20' }));

app.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


function find_index(stocks, company) {
    var num = -1;
    if (stocks.length > 0) {
        for (x in stocks) {
            if (company == stocks[x]) {
                num = x;
                return num;
            }
        }
    } else {
        return -1;
    }
    return -1;
}


function checkExists(db, collection, query) {
    return new Promise((resolve, reject) => {
        db.collection(collection).find(query, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if (doc && doc.length)
                resolve(doc);
            else
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

app.post('/getsp', async(req, res)=>{
    await sandp;
    res.json(sandp);
})

app.get('/app', function(req, res){
    res.redirect('/');
})

app.get('/login', function(req,res){
    req.flash('logged_in', 'failed')
    res.locals.message = req.flash();
	res.render('login.ejs')
})

app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym;
});

app.post('/stock/:sym', async(req, res) => {
    const sym = req.params.sym;
    const username = req.body['username'];

	const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
	const fetch_response = await fetch(api_url);
	const json = await fetch_response.json();

	res.json(json);
	const quant = req.body['quant'];

	var key = json.symbol;
    var query={"symbol": key};

    // finds document in username collection
    var doc = checkExists(db, username, query);
    doc.then(function(value) {
        db.collection(username).insertOne(
            {
                "id":1,
                "comp_name": json.companyName,
                "data" : Date.now(),
                "symbol": json.symbol,
                "latestPrice":  json.latestPrice,
                "buy_price": json.latestPrice,
                "quantity": quant,
            }
        );
    });
});

app.post('/login', function(req,res) {
    const username = req.body.username;
    const password = req.body.password;
    db.listCollections().toArray(function(err, collInfos){
    var exists = false;
    // only sends user to main page when password and username is correct
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
                }
                else{
                    if(req.flash('logged_in') != ''){
                        req.flash('logged_in', 'failed')
                        res.locals.message = req.flash();
                        res.render('login.ejs');
                    }
                    else{
                        res.locals.message = req.flash();
                        res.render('login.ejs');
                    }
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
});

app.post('/update_latest', async(req,res) => {
    const username = req.body['username'];
    var query = {"id": 1};
    var doc = checkExists(db, username, query);
    await doc.then(async(value) => {
        if(value != 0) {
            var done_arr = [];
            for(x in value){
                var querysym = value[x]["symbol"];
                if(find_index(done_arr, querysym) == -1){
                    console.log(querysym)
                    done_arr.push(querysym);
                    new_price = await get_price(querysym);
                    new_price = (new_price).toString();
                    querysym = {"symbol": querysym};
                    var new_val =  {$set: {"latestPrice": new_price} };
                    await db.collection(username).updateMany(querysym, new_val, function(err, res) {
                        if (err) throw err;
                    });
                }
            }
        }
    })        
    res.send(query);
})

async function get_price(sym){
    const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
    fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    return json.latestPrice;
}


app.post('/stockdata', async (req, res)=>{
    var query = {"id": 1};
    const username = req.body['username'];
    var data = {}
    var doc = checkExists(db, username, query);
    doc.then(function(value) {
        if (value != 0)
            res.send(value);
        else{
            res.send(data);
        }
    });
});

app.post('/app', function(req, res) {
    var message = req.flash('logged_in');
    var username = req.flash('username');
    req.flash('username', username);
    if(message == 'true') {
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
    var query = {"username": username};
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
    });
    req.flash('logged_in', 'Password Sent');
    res.locals.message = req.flash();
    res.render('login.ejs');
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
    exists.then(function(value){
        if(value == 0){
            db.createCollection(username, function(err, collection) {});
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

