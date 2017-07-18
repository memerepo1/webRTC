var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
console.log('server started on port ' + port);

var peerID = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(socket, res){
	res.render('index.ejs');
});


io.on('connection', function(socket) {
	var socketid = socket.id
	socket.emit('socketid', socketid);

	socket.on('ready', function(data) {
		socket.join(data.chat_room);
		socket.join(data.signal_room);
		socket.broadcast.to(socket).emit('announce', {
			message: 'New client in the ' + data.data + ' room.'
		})
	})

	socket.on('send', function(data) {
	    socket.broadcast.to(data.room).emit('message', {
	        message: data.message,
			author: data.author
	    });
	})

	socket.on('signal', function(data) {
	//security issue but will go for testing make more secure later
	var newConnection = false;
	if(data.type === 'user_here'){
		peerID.push(data.message);
		console.log(peerID.indexOf(data.message))
		if(peerID.indexOf(data.message) === 0 || peerID.indexOf(data.message) === 2) {
			socket.join('2ndConn');
			console.log('User joined chat room 2');
		};
		if(peerID.indexOf(data.message) === 1 || peerID.indexOf(data.message) === 2) {
			socket.join('3ndConn');
			console.log('User joined chat room 3');
		};
	}
	
	if(peerID.length > 2) {
		io.in('2ndConn').emit('2ndConnStart', 'start');
		io.in('3ndConn').emit('3ndConnStart', 'start');
	} else {
		socket.broadcast.to(data.room).emit('signaling_message', {
		    type: data.type,
			message: data.message
		});
	}

	});


socket.on('signal2nd', function(data) {

	socket.broadcast.to(data.room).emit('newPeerSignal', {
		    type: data.type,
			message: data.message
		});
	});

socket.on('signal3nd', function(data) {

	socket.broadcast.to(data.room).emit('newPeerSignal3', {
		    type: data.type,
			message: data.message
		});
	});

});

http.listen(port);