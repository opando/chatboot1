var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
var mongoose = require('mongoose');
var dbpassword = process.env.DB_PASS_SUNATFB;
//coneccion MongoDB
mongoose.connect('mongodb://opando:' + dbpassword + '@ds145369.mlab.com:45369/sunatfb', function(err, res){
		if(err)
			console.log('ERROR: Conectando a DB' + err);
		else
			console.log('coneccion a la BD satisfactoria');
});

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
