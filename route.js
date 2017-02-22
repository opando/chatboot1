module.exports  = function(app,request){
var Wit =  require('./lib/wit');

  app.get('/', function(req, res){
  	res.send('demo chatboot');
  })


  app.get('/webhook', function(req, res) {

    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'SUPER_TOKEN') {
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
           receivedMessage(event);
         } else {
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
    var sessionId = findOrCreateSession(senderID);

    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
      senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;
    var messageText = ' te estoy imitando -> ' + message.text;
    clientWit.runActions(
          sessionId, // the user's current session
          message.text, // the user's message
          sessions[sessionId].context // the user's current session state
        ).then((context) => {
          // Our bot did everything it has to do.
          // Now it's waiting for further messages to proceed.
          console.log('Waiting for next user messages.......');

          // Based on the session state, you might want to reset the session.
          // This depends heavily on the business logic of your bot.
          // Example:
          // if (context['done']) {
          //   delete sessions[sessionId];
          // }

          // Updating the user's current session state
          console.log("numRUc :> " + context.numRuc);
          messageText = context.numRuc;
          sessions[sessionId].context = context;
        })
        .catch((err) => {
          console.error('Oops! Got an error from Wit: ', err.stack || err);
        });


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

  function sendGenericMessage(recipientId, messageText) {
    console.log("paso por sendGenericMessage()");
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

  var PAGE_ACCESS_TOKEN = "EAADZBOcZCGQYQBALEaJk7ZAJZBR9AjBd1D1rlFOZBl6w0xJnrprcoCTsJS6PfxZC7QumAIZCApE7hxoGKhBq1ZCOuNZBqPGHsDfrqvZCRDMrSpiinOsZBes9S5MsJMCtLwaS553XuTQqbMcnycKS6kxvLZCC73cDnvbntQVJxwCZBkbAjFAZDZD";

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
var WIT_TOKEN = 'GXPOPFVCFO7TZW2R36RHRYW6VUWQ3B5C';
/*
let Wit = null;
let interactive = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}
*/
/*
const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();
*/

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('sending...', JSON.stringify(response));
  },
  getForecast({context, entities}) {
    var location = firstEntityValue(entities, 'location');
    if (location) {
      context.forecast = 'sunny in ' + location; // we should call a weather API here
      delete context.missingLocation;
    } else {
      context.missingLocation = true;
      delete context.forecast;
    }
    return context;
  },
  getNumRuc({context, entities}) {
    var consultaRuc = firstEntityValue(entities, 'local_search_query');
    console.log("local_search query -> " + consultaRuc);
    console.log("context ---> " + JSON.stringify(context));
    if (consultaRuc) {
      context.numRuc = '1042348967'; // we should call a weather API here
      //delete context.missingLocation;
    } else {
      //context.missingLocation = true;
      //delete context.forecast;
    }
    return context;
  }
};

const clientWit = new Wit({accessToken:WIT_TOKEN, actions});
//interactive(client);



const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};
//----------------------------------------------------

}
