var express = require('express');
var app = require('express')();
var http = require('http');
var app = express();
var server = http.createServer(app);



var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');

var recastai = require('recastai').default;

var people = {};

app.use(bodyParser.json());

app.use('/stylesheets', express.static(__dirname + '/stylesheets')); // let express use static directories on a GET request: https://stackoverflow.com/questions/5924072/express-js-cant-get-my-static-files-why#5924732 


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
	console.log("GET index.html");
});




io.on('connection', function(socket){
	console.log(socket.id + ' connected'); //for debuging in console
	
	socket.on('disconnect', function(){
	console.log('user disconnected');	
	});

		socket.on('message', function(message){
		message = JSON.parse(message);
			socket.send(people[socket.id], JSON.stringify(message)); // send to chat
			socket.broadcast.send(people[socket.id], JSON.stringify(message));


			build.dialog({ type: 'text', content: message.content}, { conversationId: socket.id }) // send to bot
  			.then(function(res) {
    			console.log(res)
    			var content = res.messages[0].content;
    			// var type = res.messages[0].type;
    			var type = 'botAnswer';
    			var id_bot = res.nlp.uuid;

    			console.log(content + ' ' + type + ' ' + id_bot); //debug botmessage

    			var botdata = {
    			content : res.messages[0].content,
    			type : type
    			};

    			socket.send(id_bot , JSON.stringify(botdata)); // let bot respond
    			socket.broadcast.send(id_bot , JSON.stringify(botdata)); // let bot respond
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});


			
			
		console.log(people[socket.id] + ' wrote: ' + message.content); // debug incoming messages	
		});


		socket.on("set_name", function(data){
			names = JSON.parse(data);
			people[socket.id] = names.name;
			var token1 = (names.token1);
			var token2 = (names.token2);


			console.log('chosen nick: ' + people[socket.id]);
			console.log('token # 1: ' + token1);
			console.log('token # 2: ' + token2);
			//var build = new recastai.build(token1, 'de');

			socket.emit('name_set', people[socket.id]);	

			// two new bot objects!

			build = new recastai.build(token1, 'de');  //  
			build_2 = new recastai.build(token2, 'de');		// 
		});


		// experimental

		socket.on("callSecondBot", function(data){

			message = JSON.parse(data);

			build_2.dialog({ type: 'text', content: message.content}, { conversationId: '22'}) // send to bot
  			.then(function(res) {
    			console.log(res)
    			var content = res.messages[0].content;
    			// var type = res.messages[0].type;
    			var type = 'botAnswer2';
    			var id_bot = res.nlp.uuid;

    			console.log(content + ' ' + type + ' ' + id_bot); //debug botmessage

    			var botdata = {
    			content : res.messages[0].content,
    			type : type
    			};

    			socket.send(id_bot , JSON.stringify(botdata)); // let bot respond
    			socket.broadcast.send(id_bot , JSON.stringify(botdata)); // let bot respond
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});

		});



		socket.on("callFirstBot", function(data){

			message = JSON.parse(data);

			build.dialog({ type: 'text', content: message.content}, { conversationId: '21'}) // send to bot
  			.then(function(res) {
    			console.log(res)
    			var content = res.messages[0].content;
    			// var type = res.messages[0].type;
    			var type = 'botAnswer';
    			var id_bot = res.nlp.uuid;

    			console.log(content + ' ' + type + ' ' + id_bot); //debug botmessage

    			var botdata = {
    			content : res.messages[0].content,
    			type : type
    			};

    			socket.send(id_bot , JSON.stringify(botdata)); // let bot respond
    			socket.broadcast.send(id_bot , JSON.stringify(botdata)); // let bot respond
			})

			.catch(function(err){
				console.error('ERROR: ', err)
			});

		});

		 // experimental end */
	
	});



server.listen(3000, function(){
	console.log('listening on *:3000');
});