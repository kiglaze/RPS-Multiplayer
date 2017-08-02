$(document).ready(function() {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyD4BCOQvF2B73qBznAx34404iKXDjIWrLA",
		authDomain: "live-rockpaperscissors-game.firebaseapp.com",
		databaseURL: "https://live-rockpaperscissors-game.firebaseio.com",
		projectId: "live-rockpaperscissors-game",
		storageBucket: "",
		messagingSenderId: "859980460971"
	};
	firebase.initializeApp(config);
	var database = firebase.database();

	var isPlayer = false;

	var activePlayers = 0;

	var playerOne = 
	{
		name: "",
		choice: "scissors"
	};

	var playerTwo = 
	{
		name: "",
		choice: "rock"
	};

	database.ref().set({
		playerOneName: "",
		playerTwoName: "",
		playerOneChoice: "scissors",
		playerTwoChoice: "rock",
		numActivePlayers: 1
	});

	database.ref().on("value", function(snapshot) {
		if (snapshot.child("playerOneName").exists()) {
			playerOne.name = snapshot.val().playerOneName;
		}
		if (snapshot.child("playerTwoName").exists()) {
			playerTwo.name = snapshot.val().playerTwoName;	
		}
		if (snapshot.child("playerOneChoice").exists()) {
			playerOne.choice = snapshot.val().playerOneChoice;
		}
		if (snapshot.child("playerTwoChoice").exists()) {
			playerTwo.choice = snapshot.val().playerTwoChoice;	
		}
		if (snapshot.child("numActivePlayers").exists()) {
			activePlayers = snapshot.val().numActivePlayers;

			console.log("isPlayer: " + isPlayer);
			console.log("activePlayers: " + activePlayers);

			if(isPlayer) {
				switch(activePlayers) {
					case 1:
						console.log("I'm the only active player.");
						break;
					case 2:
						console.log("I'm in an active game.");
						break;
					default:
						console.log("This makes no sense.");
						break;
				}
			} else {
				switch(activePlayers) {
					case 0:
						console.log("Nobody is queued to play, not even me.");
						break;
					case 1:
						console.log("Someone else is waiting to start a game. Join?");
						break;
					default:
						console.log("Game is full.");
						break;
				}
			}
		}
	});


	// connectionsRef references a specific location in our database.
	// All of our connections will be stored in this directory.
	var connectionsRef = database.ref("/connections");

	// '.info/connected' is a special location provided by Firebase that is updated
	// every time the client's connection state changes.
	// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
	var connectedRef = database.ref(".info/connected");

	// When the client's connection state changes...
	connectedRef.on("value", function(snap) {
		// If they are connected..
		if (snap.val()) {
			// Add user to the connections list.
			var con = connectionsRef.push(true);
		    // Remove user from the connection list when they disconnect.
		    con.onDisconnect().remove();
		}
	});

	// When first loaded or when the connections list changes...
	connectionsRef.on("value", function(snap) {

	  // Display the viewer count in the html.
	  // The number of online users is the number of children in the connections list.
	  //$("#connected-viewers").html(snap.numChildren());
	});

	$("input[name='submit-name']").on("click", function(event) {
		event.preventDefault();
		alert($("input[name='input-name']").val());
		$("input[name='input-name']").val("");
	});
	// $("div[name='player[1]']")
});
