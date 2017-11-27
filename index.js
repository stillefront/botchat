var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});





io.on('connection', function(socket){
	console.log(socket.id + ' connected'); //for debuging in console

	socket.send(JSON.stringify(
		{type:'serverMessage',
		message: 'Wilkommen im Chat!'
		}));

	
	socket.on('disconnect', function(){
	console.log('user disconnected');	
	});

		socket.on('message', function(message){
		message = JSON.parse(message);
		if(message.type == "userMessage"){
			socket.broadcast.send(JSON.stringify(message));
			message.type = "myMessage";
			socket.send(JSON.stringify(message));
			}
		console.log(socket.id + ' wrote: ' + message.message); // debug incoming messages	
		});
	
	});



http.listen(3000, function(){
	console.log('listening on *:3000');
});