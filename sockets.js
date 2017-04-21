var sockets = function (io) {
	io.on('connection', function (socket) {
		io.emit('user add');
		socket.on('disconnect', function(){
			io.emit('user subtract');
		});

		socket.on('chat message', function(chat){
    		io.emit('chat message', chat);
  		});
	});
};

module.exports = sockets;