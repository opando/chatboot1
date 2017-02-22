var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

//init express
var app = express();

app.set('port',(process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Ruteo
require('./route')(app);


app.listen(app.get('port'),function(){
  console.log('Servidor express escuchando en el puerto ' +  app.get('port'));
});
