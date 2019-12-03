const express = require("express");
const fetch = require("node-fetch");

const app = express();


app.listen(3000, ()=> console.log("Listening at 3000..."));
app.use(express.static("public"));
