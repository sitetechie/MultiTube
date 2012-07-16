// socketapp.js
// 
// This file handles all logic for generating and
// distributing session activity through sockets
//

// returns a random color
function randomColor() {
	// get all the possible options for a single digit
	var digit = [5,6,'a','b','c','d','e','f'];

	// start off the color string, and for all 6 digits 
	// in the color, add a random digit to the color string
	var str = '#';
	for (i = 0; i < 6; i++) {
 		str += digit[Math.floor(Math.random() * 8)];
	}

	return str;
}

// An array of users
var users = {};

// Sets up the socket server
exports.start = function(sockets) {
  sockets.on('connection', function(socket) {   
    //users[socket.id] = socket;

	// when a client emits a 'signIn' event
	socket.on('signIn', function(name) {

		// send the existing list of current users to the client
		socket.emit('loadUsers', users);

		// make a new object with the name, socket id,
		// random color, and default positions
		var user = {
			'name': name,
			'x': 50,
			'y': 50,
			'dx': 50,
			'dy': 50,
			'color': randomColor(),
			'socket': socket.id
		};

		// add the object to the server array
		users[socket.id] = user;

		// send the information to all the other clients to be added
		// to the client array
		socket.broadcast.emit('addUser', user);

	});


	// when a user moves the mouse
	socket.on('updatePosition', function(x, y) {

		// make sure we have the user in memory
		if (users[socket.id] != undefined) {

			// update the user object on the server
			users[socket.id].x = x;
			users[socket.id].y = y;
			users[socket.id].dx = x;
			users[socket.id].dy = y;

			// send the updated object back to all the clients
			socket.broadcast.emit('updateUser', users[socket.id]);

		}

	});


	// when a user sends a new chat
	socket.on('sendChat', function(msg) {

		// make sure we have the user in memory
		if (users[socket.id] != undefined) {

			// make a new object to hold the information about the chat
			var chat = {

				name: users[socket.id].name,
				x: users[socket.id].x,
				y: users[socket.id].y,
				chat: msg

			}

			// send the information back to all the clients
			sockets.emit('addChat', chat);

		};

	});


	// when the user disconnects
	socket.on('disconnect', function() {

		// remove the user from the server array
		delete users[socket.id];

		// remove the user from the client(s) array(s)
		socket.broadcast.emit('removeUser', socket.id);

	});

  });
};