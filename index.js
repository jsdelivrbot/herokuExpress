var express = require('express');
var app = express();
var mqtt = require('mqtt'), url = require('url');
var mosca = require('mosca');
require('dotenv').config();



app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// //MQTT BROKER
// var settings = {
//   port: 1883
// };
// //here we start mosca
// var server = new mosca.Server(settings);
// server.on('ready', setup);
// // fired when the mqtt server is ready
// function setup() {
//   console.log('Mosca server is up and running')
// }
// // fired whena  client is connected
// server.on('clientConnected', function(client) {
//   console.log('client connected', client.id);
// });
// // fired when a message is received
// server.on('published', function(packet, client) {
//   console.log('Published : ', packet.payload);
// });
// // fired when a client subscribes to a topic
// server.on('subscribed', function(topic, client) {
//   console.log('subscribed : ', topic);
// });
// // fired when a client subscribes to a topic
// server.on('unsubscribed', function(topic, client) {
//   console.log('unsubscribed : ', topic);
// });
// // fired when a client is disconnecting
// server.on('clientDisconnecting', function(client) {
//   console.log('clientDisconnecting : ', client.id);
// });
// // fired when a client is disconnected
// server.on('clientDisconnected', function(client) {
//   console.log('clientDisconnected : ', client.id);
// });
// // END MQTT BROKER


//MQTT client
//console.log(process.env);
//heroku config:get CLOUDMQTT_URL -> para obtener la url del servicio en heroku
var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
var mqtt_url_parse = url.parse(mqtt_url);
var auth = (mqtt_url_parse.auth || ':').split(':');
var client = mqtt.connect(mqtt_url);
//console.log(mqtt);
// var client  = mqtt.connect({
//   host: mqtt_url.hostname,
//   port: mqtt_url.port,
//   username: auth[0],
//   password: auth[1]
// });
// var client = mqtt.createClient(mqtt_url.port, mqtt_url.hostname, {
//   username: auth[0],
//   password: auth[1]
// });

console.log('pre-connect');
client.on('connect', function() { // When connected
  console.log('connect');
  // subscribe to a topic
  client.subscribe('hello/world', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  });

  // publish a message to a topic
  // client.publish('hello/world', 'my message', function() {
  //   console.log("Message is published");
  //   client.end(); // Close the connection when published
  // });

  app.get('/send', function(request, response) {
    response.render('pages/index');
    client.publish('hello/world', 'my message', function() {
      console.log("Message is published");
      //client.end(); // Close the connection when published
    });
  });

  app.get('/stream', function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n');
    }, 20000);

    client.subscribe('hello/world', function() {
      client.on('message', function(topic, msg, pkt) {
        //res.write("New message\n");
        //var json = JSON.parse(msg);
        res.write("data: " + msg + "\n\n");
      });
    });
  });
});



