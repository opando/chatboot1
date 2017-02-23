module.exports  = function(app,request){
//var Wit =  require('./lib/wit');
//var fetch = require('node-fetch');
var PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;
let FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
var beneficiosRMT = "-No presentar las declaraciones que contengan la determinación de la deuda tributaria, dentro de los plazos establecidos.\n-Omitir llevar los libros de contabilidad, u otros libros y/o registros u otros medios de control exigidos por las leyes y reglamentos\n-Llevar los libros de contabilidad, u otros libros y/o registros sin observar la forma y condiciones establecidas en las normas correspondientes.\n-Llevar con atraso mayor al permitido por las normas vigentes, los libros de contabilidad u otros libros o registros.\n-No exhibir los libros, registros u otros documentos que la Administración Tributaria solicite.";


  app.get('/', function(req, res){
  	res.send('demo chatboot');
  })


  app.get('/webhook', function(req, res) {

    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      //res.sendStatus(403);
      res.send('no configurado');
    }
  });

  app.post('/webhook', function (req, res) {
   var data = req.body;

   // Make sure this is a page subscription
   if (data.object === 'page') {

     // Iterate over each entry - there may be multiple if batched
     data.entry.forEach(function(entry) {
       var pageID = entry.id;
       var timeOfEvent = entry.time;

       // Iterate over each messaging event
       entry.messaging.forEach(function(event) {
         if (event.message) {
           if(event.message.is_echo){
             console.log("is echo : " + JSON.stringify(event.message));
           }else{
             receivedMessage(event);
            }
         } if (event.postback) {
           receivedPostback(event);
         }else {
           console.log("Webhook received unknown event: ", event);
         }
       });
     });

     // Assume all went well.
     //
     // You must send back a 200, within 20 seconds, to let us know
     // you've successfully received the callback. Otherwise, the request
     // will time out and we will keep trying to resend.
     res.sendStatus(200);
   }
 });


  function receivedMessage(event) {
    var senderID = event.sender.id;
    //var sessionId = findOrCreateSession(senderID);

    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
      senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;
    var messageText = null;

    if (message.text!='generic') {
      messageText = ' te estoy imitando -> ' + message.text;
    }else{
      messageText = message.text;
    }




    var messageAttachments = message.attachments;

    if (messageText) {

      // If we receive a text message, check to see if it matches a keyword
      // and send back the example. Otherwise, just echo the text we received.
      switch (messageText) {
        case 'generic':
          sendGenericMessage(senderID);
          break;

        default:
          sendTextMessage(senderID, messageText);
      }
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Message with attachment received");
    }
  }

  function receivedPostback(event){
    var senderID = event.sender.id;
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: beneficiosRMT
      }
    };

    callSendAPI(messageData);
  }

  function sendGenericMessage(recipientId, messageText) {
    console.log("paso por sendGenericMessage()");

    var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Régimen MYPE Tributario (RMT)",
            subtitle: "Si tienes una empresa domiciliada en el país cuyos ingresos netos anuales proyectados no superen 1 700 UIT en el ejercicio, el Régimen MYPE Tributario (RMT) podría ser para ti.",
            item_url: "http://eboletin.sunat.gob.pe/index.php?option=com_content&view=article&id=315:regimen-mype-tributario-primeras-interrogantes-sobre-este-nuevo-regimen&catid=1:orientacion-tributaria",
            image_url: "http://eboletin.sunat.gob.pe/images/imagenes/mype_1.jpg",
            buttons: [{
              type: "web_url",
              url: "http://eboletin.sunat.gob.pe/index.php?option=com_content&view=article&id=311:regimen-mype-tributario-un-nuevo-regimen-para-los-contribuyentes&catid=1:orientacion-tributaria",
              title: "Un nuevo régimen para los contribuyentes"
            }, {
              type: "postback",
              title: "¿Qué beneficios tiene el Régimen MYPE Tributario (RMT)?",
              payload: "beneficios RMT",
            }],
          }, {
            title: "Consulta Estado Devolucion",
            subtitle: "Consulta Estado de la Solicitud de Devolución",
            item_url: "http://orientacion.sunat.gob.pe/index.php/personas-menu/devoluciones-personas/6812-08-opcion-de-consulta-estado-de-la-solicitud-de-devolucion",
            image_url: "http://orientacion.sunat.gob.pe/images/devoluciones/pasounodevoluciones.JPG",
            buttons: [{
              type: "web_url",
              url: "https://www.youtube.com/watch?v=CfNLF6gEZS4&feature=youtu.be",
              title: "ver guia (video)"
            },{
              type: "web_url",
              url: "https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm",
              title: "SUNAT Operaciones en Linea"
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
  }

  function sendTextMessage(recipientId, messageText) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    };

    callSendAPI(messageData);
  }



  function callSendAPI(messageData) {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;

        console.log("Successfully sent generic message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });
  }

//----------------------------------------------------

//----------------------------------------------------

}
