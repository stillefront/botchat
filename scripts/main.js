$(document).ready(function(){

	var socket = io();
	$('#chat').hide();

	var smoothscroll = function(){
		$('#messages').stop().animate({
  			scrollTop: $('#messages')[0].scrollHeight
		}, 800);
	};


	socket.on('message', function(who, data){
		data = JSON.parse(data);

		

		if (data.type == 'botAnswer') {
			$('#messages').append('<p class="bot1message">' + who + '&nbsp;wrote:&nbsp;' + '<br>' + data.content + '&nbsp;(&nbsp;' +  data.type + '&nbsp;)' + '</p>');

		} else if (data.type == 'botAnswer2') {
			$('#messages').append('<p class="bot2message">' + who + '&nbsp;wrote:&nbsp;' + '<br>' + data.content + '&nbsp;(&nbsp;' +  data.type + '&nbsp;)' + '</p>');
		} else {
			$('#messages').append('<p>' + who + '&nbsp;wrote:&nbsp;' + '<br>' + data.content + '&nbsp;(&nbsp;' +  data.type + '&nbsp;)' + '</p>');
		};

		


		// experimental bot conversation
		if (data.type == 'botAnswer') {
			setTimeout(function(){
			socket.emit("callSecondBot", JSON.stringify(data))}, 3000 //short timeout for realism ;)
			);
		};
		if (data.type == 'botAnswer2') {
			setTimeout(function(){
			socket.emit("callFirstBot", JSON.stringify(data))}, 3000
			);
		};
		// experimental end

		//scroll smoothly to bottom after every message

		
		smoothscroll();

		/*$('#messages').stop().animate({
  			scrollTop: $('#messages')[0].scrollHeight
		}, 800); */


	});


	$('form').submit(function(){
		var data = {
			id: socket.id,
			content: $('#m').val(),
			type: 'userMessage'
		};
		socket.send(JSON.stringify(data)); //socket.send sends messages which are received with the 'message' event
		$('#m').val('');
		return false;
	});


	$('#stop').click(function(){
		$('#messages').append('<p class="sysmessage">' + 'Verbindung getrennt. ' + '</p>');
		smoothscroll();
		socket.disconnect(); // disconnect and stop chat!

		

	});


	$('#setname').click(function(){
		var data = {
			token1: $('#bot1').val(),
			token2: $('#bot2').val(),
			namebot1: $('#namebot1').val(),
			namebot2: $('#namebot2').val(),
			name: $('#nickname').val()
		};
		socket.emit("set_name", JSON.stringify(data));
	});


	socket.on('name_set', function(who){
		$('#nameform').hide();
		$('#chat').show();
		$('#messages').append('<p class="sysmessage">' + 'Willkommen im chatbotchat, '+ who + '&nbsp;!' + '</p>');
		smoothscroll();

	});

	
}); // end jQuery