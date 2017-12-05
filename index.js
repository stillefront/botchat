var express   =  require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var recastai = require('recastai').default;

var build = new recastai.build('0e804b207bb77410a806a83ae1ef219a', 'de');

var build_2 = new recastai.build('55055ed53033a4801c4f2477dc98d30e', 'de');

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
			people[socket.id] = data;
			console.log(people[socket.id]);

			socket.emit('name_set', people[socket.id]);			
		});


		// experimental

		socket.on("callOtherBot", function(data){

			message = JSON.parse(data);

			build_2.dialog({ type: 'text', content: message.content}, { conversationId: '22'}) // send to bot
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



http.listen(3000, function(){
	console.log('listening on *:3000');
});