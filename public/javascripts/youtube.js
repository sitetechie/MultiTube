// load the youtube iframe api asynchronously
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

// create a youtube iframe player after the api has finished downloading
onYouTubePlayerAPIReady = function() {
	// initialize player
	window.initPlayer = function(videoId) {
		player = new YT.Player('player', {
			height: '402',
			width: '720',
			videoId: videoId,
			playerVars: {
				'modestbranding': 0,
				'rel': 0,
				'showinfo': 0,
				'theme': 'light',
				'iv_load_policy': 3,
				'enablejsapi': 1,
				'origin': 'localhost',
				'autoplay': 1
			},
			events: {
				'onReady': onReady,
			    'onStateChange': onStateChange
			}
		});
	};
	var youtube_id = $('#player').data('youtube');
	window.initPlayer(youtube_id);
};

// when the video player is ready
onReady = function(event) {
	//console.log('the player is ready!');
};

// events
onStateChange = function(event) {
	var embedCode = event.target.getVideoEmbedCode();

	// if the user drags the slider
	if (event.data == YT.PlayerState.PLAYING) {
		//console.log(event.target.getCurrentTime());
	}

};
