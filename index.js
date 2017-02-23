var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
//var fetch = require('node-fetch');

/*
module.exports = {
  log: require('./lib/log'),
  Wit: require('./lib/wit'),
  interactive: require('./lib/interactive')
};
*/

//init express
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Ruteo
require('./route')(app,request);


app.listen(app.get('port'),function(){
  console.log('Servidor express escuchando en el puerto ' , app.get('port'));
});
