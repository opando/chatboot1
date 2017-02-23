var mongoose = require('mongoose');

module.exports = mongoose.model('messagefb', {
	message: String ,fechaEnvio : String, tipoMSG : String, clasificacion: String

});
