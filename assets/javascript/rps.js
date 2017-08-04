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


	var gameplayStates = {
	    EMPTY: 0,
	    WAITING: 1,
	    FULL: 2
	};
	var rpsChoices = {
	    ROCK: 0,
	    PAPER: 1,
	    SCISSORS: 2
	};
	var playerStates = {
		NOT: 0,
		FIRST: 1,
		SECOND: 2
	}

	var currentState = gameplayStates.EMPTY;

	var isPlayer = false;

	var activePlayers = 0;

	var playerOne = 
	{
		name: "",
		choice: null
	};

	var playerTwo = 
	{
		name: "",
		choice: null
	};

	database.ref().set({
		playerOneName: "",
		playerTwoName: "",
		playerOneChoice: null,
		playerTwoChoice: null,
		numActivePlayers: 0,
		gameState: gameplayStates.EMPTY
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
		if (snapshot.child("gameState").exists()) {
			currentState = snapshot.val().gameState;
			updateHtmlByGameState(currentState);
		}
	});




	$("input[name='submit-name']").on("click", function(event) {
		event.preventDefault();
		debugger;
		var addedUserName = $("input[name='input-name']").val();
		if(currentState == gameplayStates.EMPTY || currentState == gameplayStates.WAITING) {
			activePlayers++;
			switch(currentState) {
				case gameplayStates.EMPTY:
					playerOne.name = addedUserName;
					currentState = gameplayStates.WAITING;
					break;
				case gameplayStates.WAITING:
					playerTwo.name = addedUserName;
					currentState = gameplayStates.FULL;
					break;
			}
			database.ref().set({
				playerOneName: playerOne.name,
				playerTwoName: playerTwo.name,
				playerOneChoice: playerOne.choice,
				playerTwoChoice: playerTwo.choice,
				numActivePlayers: activePlayers,
				gameState: currentState
			});
		}

		$("input[name='input-name']").val("");
	});
	// $("p[name='player-name[1]']")

	function updateHtmlByGameState(gameState) {
		switch(gameState) {
			case gameplayStates.EMPTY:
				$("p[name='player-message[1]']").show();
				$("p[name='player-message[2]']").show();
				$("ul[name='rps-options[1]']").hide();
				$("ul[name='rps-options[2]']").hide();
				break;
			case gameplayStates.WAITING:
				$("p[name='player-message[1]']").hide();
				$("p[name='player-message[2]']").show();
				$("p[name='player-name[1]']").text(playerOne.name);
				$("ul[name='rps-options[1]']").show();
				$("ul[name='rps-options[2]']").hide();
				break;
			case gameplayStates.FULL:
				$("p[name='player-message[1]']").hide();
				$("p[name='player-message[2]']").hide();
				$("p[name='player-name[1]']").text(playerOne.name);
				$("p[name='player-name[2]']").text(playerTwo.name);
				$("ul[name='rps-options[1]']").show();
				$("ul[name='rps-options[2]']").show();
				break;
		}
	}
});
