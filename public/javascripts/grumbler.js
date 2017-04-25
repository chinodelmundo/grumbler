var eventHandlers = {
	init: function(){
		$(".toggle-comments-btn").on("click", function(e){
			$target = $(e.target);
			var string = $target.text();
			string.substr(0, 13) == "Show comments" ? $target.text("Hide comments " + string.substr(14)) : $target.text("Show comments " + string.substr(14));
			$target.parent().parent().next().toggle(200);
		});

		var socket = io();
	    $('#sent-message-btn').on('click', function(e){
	    	if($('#new-message-text').val() != ''){
		    	var chat = {
		    		username: $('#new-message-username').val(),
		    		text: $('#new-message-text').val()
		    	};

		      	socket.emit('chat message', chat);
		      	$('#new-message-text').val('');
	    	}
	      	return false;
	    });

		socket.on('chat message', function(chat){
		   	$message = $('<div>').addClass('message');
		   	$username = $('<div>').addClass('chat-username').text(chat.username + ': ');
		   	$text = $('<div>').addClass('chat-text').text(chat.text);

		   	$message.append($username).append($text);
	      	$('#chat-content').append($message);
	    });

	    socket.on('users count', function(count){
	    	$('#users-count').text(count + $('#users-count').text().substr(1));
	    });

	    var newGrumbleCount = 0;
	    $(document).on('submit','#new-grumble-form',function(){
	    	socket.emit('new grumble', 1);
	    });

	    socket.on('new grumble', function(value){
	    	newGrumbleCount++;
	    	$('#update-stream a').text(newGrumbleCount + ' New Grumbles. Click to show.')
	    	$('#update-stream').show(300);
	    });

	    $('#update-stream').on('click', function(e){
	    	newGrumbleCount = 0;
	    	$target = $(e.target);
	    	$target.hide(300);
	    });
	}
};

$(document).ready( function(){
	eventHandlers.init();
});