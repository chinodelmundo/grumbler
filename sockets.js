var sockets = function (io) {
	var userCount = 0;

	io.on('connection', function (socket) {
		userCount++;
		io.emit('users count', userCount);
		socket.on('disconnect', function(){
			userCount--;
			io.emit('users count', userCount);
		});

		socket.on('chat message', function(chat){
    		io.emit('chat message', chat);
  		});
	});
};

module.exports = sockets;