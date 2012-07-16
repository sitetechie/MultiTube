
var User = function(opts) {
	console.log('create user ', opts);
    
	// user "constructor"
	this.info = $.extend({
		x: 50,
		y: 50,
		name: 'John Doe',
		color: '#CCCCCC'

	}, opts);

	// set the new x and y to the original x and y for now
	this.info.dx = this.info.x;
	this.info.dy = this.info.y;


	// add the user div to the page
	$('body').append('<div class="user"></div>');

	// set the pointer to the element for access in jquery
	var clip = $('body').children('.user').last();

	// update the user with the supplied information
	clip.css({
		'top': this.info.y + '%',
		'left': this.info.x + '%',
		'background-color': this.info.color

	});

	// add the name to the user
	clip.append('<div class="name">' + this.info.name + '</div>');   
	this.clip = clip;     

	// update the user to a new position on the screen
	this.update = function() {

		// make sure the new x and y are far enough to warren an update
		if ((Math.floor(Math.abs(this.info.dx - this.info.x)) > 0.1) ||
			(Math.floor(Math.abs(this.info.dy - this.info.y)) > 0.1)) {

			// move the user to the new position
			this.clip.css({
				'top': this.info.dy + '%',
				'left': this.info.dx + '%'
			});

			// update the current x and y positions in the object
			this.info.x = this.info.dx;
			this.info.y = this.info.dy;

		}
	};

};

(function() {
	var USERS = window.USERS = {};

	// --------------------------------- 
	// SOCKET.IO EVENTS

	var socket = io.connect();

	// when you connect to the page, send some information
	socket.on('connect', function() {
		// get the users name from the prompt and
		// send it to the signIn server funciton
		socket.emit('signIn', prompt('Please enter your name:'));
	});

	// when you connect to the page, get the users
	socket.on('loadUsers', function(data) {

		// run through all the users and add them to the
		// array with the information provided
		$.each(data, function(socket, info) {
			USERS[socket] = new User(info);
		});

	});

	// when another user connects to the page
	// send the user object over to be added to the array
	socket.on('addUser', function(data) {
		// add the user to the array using the socket id
		// as the index and the data as the options
		USERS[data.socket] = new User(data);

	});	

	// update a specific cursor position (use the socket id as the array index)
	socket.on('updateUser', function(data) {

		// make sure the user is in memory
		if (USERS[data.socket] != undefined) {

			// update the user's future position
			USERS[data.socket].info.dx = data.dx;
			USERS[data.socket].info.dy = data.dy;
		}
	});

	// adds a chat bubble when someone sends a new chat
	socket.on('addChat', function(data) {

		// build the html string to represent the chat
		var str = '<div class="chat_box" style="display: none;">';
		str += '<div class="name"><i class="icon-comment"></i>';
		str += data.name + ' says...</div>';
		str += '<div class="message">' + data.chat + '</div>';
		str += '</div>';

		// add the chat to the page
		$('body').append(str);

		// position the chat appropriately and fade it in
		$('body').children('.chat_box').last().css({

			top: data.y + '%',
			left: data.x + '%'

		}).fadeIn();

		// set up a timed fadeout after n seconds
		$('body').children('.chat_box').last().delay(4000).fadeOut();
	});
	
	// when a user disconnects from the page
	socket.on('removeUser', function(socketId) {

		// remove the element from the dom
		USERS[socketId].clip.remove();

		// remove the element from the array
		delete USERS[socketId];
	});	

	// ---------- APP OBJECT ---------- \\

	window.app = {

		fps: 30,
		depth: 1000,

		// basic initialize function
		start: function() {

			// start the app loop
			this.loop = setInterval(this.frame, 1000 / this.fps);

		},

		// the app loop, runs n frames per second
		frame: function() {

			// go through all the users and call the update function
			$.each(USERS, function(socket, user) {
				user.update();
			});

		}
	};


//-- JQUERY DOCREADY
  $(function(){

	// ---------- MOUSE MOVE ---------- \\

	// anytime the mouse is moving in the page
	$('body').mousemove(function(e) {

		// if the chat box is visible, get and update the mouse position
		// otherwise, the cursor will be in the same place while they are
		// entering a message
		if ($('#chat').css('display') == 'none') {

			// grab the position of the mouse
			// var x = e.pageX; // absolute position using pixels
			// var y = e.pageY; // absolute position using pixels
			var y = Math.floor((e.pageY / $('body').height()) * 100); // absolute position using percent
			var x = Math.floor((e.pageX / $('body').width()) * 100); // absolute position using percent

			// move the chat box to the position
			$('#chat').css({
				'top': (y) + '%',
				'left': (x) + '%'

			});

			// SOCKETS: update position
			socket.emit('updatePosition', x, y);
		}

	});

	// when the user doubleclicks the page, stop the mouse move functions
	// and show the chat box
	$('body').dblclick(function() {

		$('#chat').fadeIn();
		$('#chat #comment').focus();

	});

	// when the mouse leaves the chat box, fade it back out and start
	// the mouse tracking again
	$('#chat').mouseleave(function() {

		$('#chat').fadeOut();

	});


	// ---------- CHAT FUNCTIONS ---------- \\

	// if someone clicks on the send button
	$('#chat .icon-chevron-right').click(function() {

		// send the message, empty the input, fadeout the window
		sendMessage($('#chat #comment').val());
		$('#chat #comment').val('');
		$('#chat').fadeOut();

	});

	// if someone hits the enter button in the chat box
	$('#chat #comment').keypress(function(e) {

		// make sure the key was the enter key
		if (e.which == 13) {

			// send the message, empty the input, fadeout the window
			sendMessage($('#chat #comment').val());
			$('#chat #comment').val('');
			$('#chat').fadeOut();

		}

	});

	// if someone clicks on one of the icons
	$('#chat #icons li').click(function() {

		// send the html representing the li and fadeout the window
		sendMessage($(this).html());
		$('#chat').fadeOut();

	});

	// a function that takes in a string and sends it to the server
	function sendMessage(msg) {

		// SOCKETS: send a new chat message
		socket.emit('sendChat', msg);

	}

	// initialize the application
	app.start();

  });	

//-- END JQUERY DOCREADY

})();