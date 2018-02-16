var express = require('express');
var app = require('express')();
var http = require('http');
var app = express();
var server = http.createServer(app);


var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');

var recastai = require('recastai').default;

var people = {};

var namebot1 = {};
var	namebot2 = {};


var bot_array = {};
//var bot_2 = {};

//escaping our json-strings (https://stackoverflow.com/questions/4253367/how-to-escape-a-json-string-containing-newline-characters-using-javascript#4253415)
String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
};



app.use('/stylesheets', express.static(__dirname + '/stylesheets')); // let express use static directories on a GET request: https://stackoverflow.com/questions/5924072/express-js-cant-get-my-static-files-why#5924732 
app.use('/scripts', express.static(__dirname + '/scripts'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
	console.log("GET index.html");
});




io.on('connection', function(socket){
	

	// experimental
	var room = ('room_' + socket.id); // generate dynamic room name
	socket.join(room);

	var bot_id_1 = (socket.id + '_bot1');
	var	bot_id_2 = (socket.id + '_bot2');

	console.log(socket.id + ' connected to room ' + room ); //for debuging in console

	// experimental end
	
	socket.on('disconnect', function(){
		console.log('user disconnected');	
		delete bot_array[bot_id_1];
		console.log("bot_1 deleted");
		delete bot_array[bot_id_2];
		console.log("bot_2 deleted");
	});

		socket.on('message', function(message){
		message = JSON.parse(message);

		var message_json = JSON.stringify(message);
		var message_json_esc = message_json.escapeSpecialChars();

			socket.emit('message', people[socket.id], message_json_esc); // send to client
			socket.to(room).emit('message',people[socket.id], message_json_esc); // send to room


			bot_array[bot_id_1].dialog({ type: 'text', 'content': message.content}, { conversationId: people[socket.id] }) // send to bot
  			.then(function(res) {
    			// console.log(res)
    			var msg = [];
    			for (var i = 0; i < res.messages.length; i++) {
    				msg[i] = res.messages[i].content; 	
    			}
    			console.log('content: ', msg);

    			var content = msg.join('<br>');


    			var type = 'botAnswer';
    			var id_bot = res.nlp.uuid;

    			var botdata = {
    			"content" : content,
    			"type" : type
    			};

    			var botdata_json = JSON.stringify(botdata);
				var botdata_json_esc = botdata_json.escapeSpecialChars();

    			socket.emit('message', namebot1[socket.id] , botdata_json_esc); // let bot respond in client
    			socket.to(room).emit('message', namebot1[socket.id] , botdata_json_esc); // let bot respond to room
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});


			
			
		console.log(people[socket.id] + ' in room ' + room + ' wrote: ' + message.content); // debug incoming messages	
		});


		socket.on("set_name", function(data){
			names = JSON.parse(data);
			people[socket.id] = names.name;
			var token1 = names.token1;
			var token2 = names.token2;
			namebot1[socket.id] = names.namebot1;
			namebot2[socket.id] = names.namebot2;


			console.log('chosen nick: ' + people[socket.id]);
			console.log('token # 1: ' + token1);
			console.log('token # 2: ' + token2);

			socket.emit('name_set', people[socket.id]);	

			// two new bot objects!


			bot_array[bot_id_1] = new recastai.build(token1, 'de');  //
			console.log(bot_array[bot_id_1]);

			bot_array[bot_id_2] = new recastai.build(token2, 'de');  //
			console.log(bot_array[bot_id_2]); 
		});


		socket.on("callSecondBot", function(data){

			message = JSON.parse(data);

			bot_array[bot_id_2].dialog({ type: 'text', content: message.content}, { conversationId: people[socket.id] }) // send to bot
  			.then(function(res) {
    			// console.log(res)
    			var msg = [];
    			for (var i = 0; i < res.messages.length; i++) {
    				msg[i] = res.messages[i].content; 	
    			}
    			console.log('content: ', msg);

    			var content = msg.join('<br>');

    			var type = 'botAnswer2';
    			var id_bot = res.nlp.uuid;

    			// console.log(content + ' ' + type + ' ' + id_bot); //debug botmessage

    			var botdata = {
    			"content" : content,  // bei allen json dingern // https://stackoverflow.com/questions/4253367/how-to-escape-a-json-string-containing-newline-characters-using-javascript#4253415
    			"type" : type  // alle jsons vorher escapen und reinigen (injectiongefahr)
    			};

    			var botdata_json = JSON.stringify(botdata);
				var botdata_json_esc = botdata_json.escapeSpecialChars();

    			socket.emit('message', namebot2[socket.id] , botdata_json_esc); // let bot respond
    			socket.to(room).emit( 'message', namebot2[socket.id] , botdata_json_esc); // let bot respond
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});

		});



		socket.on("callFirstBot", function(data){

			message = JSON.parse(data);

			bot_array[bot_id_1].dialog({ type: 'text', content: message.content}, { conversationId: people[socket.id]}) // send to bot
  			.then(function(res) {
    			// console.log(res)
    			var msg = [];
    			for (var i = 0; i < res.messages.length; i++) {
    				msg[i] = res.messages[i].content; 	
    			}
    			console.log('content: ', msg);

    			var content = msg.join('<br>');


    			var type = 'botAnswer';
    			var id_bot = res.nlp.uuid;

    			//console.log(content + ' ' + type + ' ' + id_bot); //debug botmessage

    			var botdata = {
    			"content" : content,
    			"type" : type
    			};

    			var botdata_json = JSON.stringify(botdata);
				var botdata_json_esc = botdata_json.escapeSpecialChars();

    			socket.emit('message', namebot1[socket.id] , botdata_json_esc); // let bot respond
    			socket.to(room).emit('message', namebot1[socket.id] , botdata_json_esc); // let bot respond
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});

		});
	
	});



server.listen(3000, function(){
	console.log('listening on *:3000');
});