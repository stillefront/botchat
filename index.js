var express   =  require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var people = {};



app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
	console.log("GET index.html");
});

app.use('/stylesheets', express.static(__dirname + '/stylesheets')); // let express use static directories on a GET request: https://stackoverflow.com/questions/5924072/express-js-cant-get-my-static-files-why#5924732 





io.on('connection', function(socket){
	console.log(socket.id + ' connected'); //for debuging in console

	
	socket.on('disconnect', function(){
	console.log('user disconnected');	
	});

		socket.on('message', function(message){
		message = JSON.parse(message);
		if(message.type == "userMessage"){
			socket.broadcast.send(people[socket.id], JSON.stringify(message));
			message.type = "myMessage";
			socket.send(people[socket.id], JSON.stringify(message));

			}
		console.log(people[socket.id] + ' wrote: ' + message.message); // debug incoming messages	
		});

		socket.on("set_name", function(data){
			people[socket.id] = data;
			console.log(people[socket.id]);

			socket.emit('name_set', people[socket.id]);			
		});
	
	});



http.listen(3000, function(){
	console.log('listening on *:3000');
});