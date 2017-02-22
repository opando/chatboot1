var express = require('express');
var express = require('request');
var express = require('body-parser');

//init express
var app = express();

app.set('port',5000);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Ruteo
require('./route')(app);


app.listen(app.get('port'),function(){
  console.log('Servidor express escuchando en el puerto ' +  app.get('port'));
});
