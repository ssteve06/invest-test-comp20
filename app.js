//Author: Justin Steinberg
//Using Express Framework
const express = require("express");
const fetch = require("node-fetch");

const app = express();


app.listen(3000, ()=> console.log("Listening at 3000..."));
app.use(express.static("public"));

app.get('/stock/:sym', async (req,res) => {
	const sym = req.params.sym; 
	console.log(sym);
	const api_url = 'https://cloud.iexapis.com/stable/stock/'+sym+'/quote?token=pk_065b1600526c4ad5b953052a98fa7070';
	const fetch_response = await fetch(api_url);
	const json = await fetch_response.json();
	res.json(json);
});

