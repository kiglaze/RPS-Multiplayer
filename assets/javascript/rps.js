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
	var gameOutcomeState = {
		LOSS: 0,
		TIE: 1,
		WIN: 2
	}
	var outcomeStateFromText = {
		"rock": rpsChoices.ROCK,
		"paper": rpsChoices.PAPER,
		"scissors": rpsChoices.SCISSORS
	}

	var currentState = gameplayStates.EMPTY;

	var isPlayer = false;

	var activePlayers = 0;

	var myPlayer = playerStates.NOT;

	var playerOne = 
	{
		name: "",
		choice: null,
		wins: 0,
		losses: 0
	};

	var playerTwo = 
	{
		name: "",
		choice: null,
		wins: 0,
		losses: 0
	};


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
		if (snapshot.child("playerOneWins").exists() || snapshot.child("playerOneLosses").exists()) {
			playerOne.wins = snapshot.val().playerOneWins;
			playerOne.losses = snapshot.val().playerOneLosses;	
			$("span[name='player-wins-count[1]']").text(playerOne.wins);
			$("span[name='player-losses-count[1]']").text(playerOne.losses);
		}
		if (snapshot.child("playerTwoWins").exists() || snapshot.child("playerTwoLosses").exists()) {
			playerTwo.wins = snapshot.val().playerTwoWins;
			playerTwo.losses = snapshot.val().playerTwoLosses;	
			$("span[name='player-wins-count[2]']").text(playerTwo.wins);
			$("span[name='player-losses-count[2]']").text(playerTwo.losses);
		}
		if (snapshot.child("numActivePlayers").exists()) {
			activePlayers = snapshot.val().numActivePlayers;
		}
		if (snapshot.child("gameState").exists()) {
			currentState = snapshot.val().gameState;
			updateHtmlByGameState(currentState);
		} else {
			database.ref().set({
				playerOneName: "",
				playerOneChoice: null,
				playerOneWins: 0,
				playerOneLosses: 0,
				playerTwoName: "",
				playerTwoChoice: null,
				playerTwoWins: 0,
				playerTwoLosses: 0,
				numActivePlayers: 0,
				gameState: gameplayStates.EMPTY
			});
		}
		if(currentState == gameplayStates.FULL && playerOne.choice !== null && playerTwo.choice !== null) {
			$(document).trigger("gameFaceoff");
		}
	});

	$(document).on("gameFaceoff", function() {
		var gameWinner = determineGameWinner(outcomeStateFromText[playerOne.choice], outcomeStateFromText[playerTwo.choice]);
		switch(gameWinner) {
			case playerStates.FIRST:
			playerOne.wins++;
			playerTwo.losses++;
			$('.winner-name').text(playerOne.name + " Wins!!!");
			break;
			case playerStates.SECOND:
			playerTwo.wins++;
			playerOne.losses++;
			$('.winner-name').text(playerTwo.name + " Wins!!!");
			break;
			case playerStates.NOT:
			$('.winner-name').text("Tie!!!");
			break;
		}
		$("p[name='player-choice[1]']").text(playerOne.choice);
		$("p[name='player-choice[2]']").text(playerTwo.choice);
		playerOne.choice = null;
		playerTwo.choice = null;
		updateDbWithVariables();
	});

	function determineGameWinner(playerOneRpsChoice, playerTwoRpsChoice) {
		var gameWinner = playerStates.NOT;
		switch(playerOneRpsChoice) {
			case(rpsChoices.ROCK):
			switch(playerTwoRpsChoice) {
				case(rpsChoices.PAPER):
				gameWinner = playerStates.SECOND;
				break;
				case(rpsChoices.SCISSORS):
				gameWinner = playerStates.FIRST;
				break;
			}
			break;
			case(rpsChoices.PAPER):
			switch(playerTwoRpsChoice) {
				case(rpsChoices.ROCK):
				gameWinner = playerStates.FIRST;
				break;
				case(rpsChoices.SCISSORS):
				gameWinner = playerStates.SECOND;
				break;
			}
			break;
			case(rpsChoices.SCISSORS):
			switch(playerTwoRpsChoice) {
				case(rpsChoices.ROCK):
				gameWinner = playerStates.SECOND;
				break;
				case(rpsChoices.PAPER):
				gameWinner = playerStates.FIRST;
				break;
			}
			break;
		}
		return gameWinner;
	}

	$("input[name='submit-name']").on("click", function(event) {
		event.preventDefault();
		var addedUserName = $("input[name='input-name']").val();
		if(addedUserName && (currentState == gameplayStates.EMPTY || currentState == gameplayStates.WAITING)) {
			activePlayers++;
			switch(currentState) {
				case gameplayStates.EMPTY:
					myPlayer = playerStates.FIRST;
					playerOne.name = addedUserName;
					playerOne.choice = null;
					playerOne.wins = 0;
					playerOne.losses = 0;
					currentState = gameplayStates.WAITING;
					break;
				case gameplayStates.WAITING:
					myPlayer = playerStates.SECOND;
					playerTwo.name = addedUserName;
					playerTwo.choice = null;
					playerTwo.wins = 0;
					playerTwo.losses = 0;
					currentState = gameplayStates.FULL;
					break;
			}
			updateDbWithVariables();
		}

		$("input[name='input-name']").val("");
	});
	// $("p[name='player-name[1]']")

	function updateDbWithVariables() {
		database.ref().set({
			playerOneName: playerOne.name,
			playerOneChoice: playerOne.choice,
			playerOneWins: playerOne.wins,
			playerOneLosses: playerOne.losses,
			playerTwoName: playerTwo.name,
			playerTwoChoice: playerTwo.choice,
			playerTwoWins: playerTwo.wins,
			playerTwoLosses: playerTwo.losses,
			numActivePlayers: activePlayers,
			gameState: currentState
		});
	}

	$(".rps-choice").on("click", function(e) {
		var choice = $(this).attr("data-choice");
		var playerNum = parseInt($(this).attr("data-player"));
		switch(playerNum) {
			case(playerStates.FIRST):
				playerOne.choice = choice;
				updateDbWithVariables();
				break;
			case(playerStates.SECOND):
				playerTwo.choice = choice;
				updateDbWithVariables();
				break;
		}
	});

	function updateHtmlByGameState(gameState) {
		switch(gameState) {
			case gameplayStates.EMPTY:
				$("p[name='player-message[1]']").show();
				$("p[name='player-message[2]']").show();
				$("p[name='player-name[1]']").empty();
				$("p[name='player-name[2]']").empty();
				$("ul[name='rps-options[1]']").hide();
				$("ul[name='rps-options[2]']").hide();
				$("[name='player-choice[1]']").empty();
				$("[name='player-choice[2]']").empty();
				$("[name='wins-losses-container[1]']").hide();
				$("[name='wins-losses-container[2]']").hide();

				break;
			case gameplayStates.WAITING:
				$("p[name='player-message[1]']").hide();
				$("p[name='player-message[2]']").show();
				$("p[name='player-name[1]']").text(playerOne.name);
				$("p[name='player-name[2]']").empty();
				$("ul[name='rps-options[1]']").show();
				$("ul[name='rps-options[2]']").hide();
				$("[name='player-choice[2]']").empty();
				$("[name='wins-losses-container[1]']").show();
				$("[name='wins-losses-container[2]']").hide();
				break;
			case gameplayStates.FULL:
				$("p[name='player-message[1]']").hide();
				$("p[name='player-message[2]']").hide();
				$("p[name='player-name[1]']").text(playerOne.name);
				$("p[name='player-name[2]']").text(playerTwo.name);
				$("ul[name='rps-options[1]']").show();
				$("ul[name='rps-options[2]']").show();
				$("[name='wins-losses-container[1]']").show();
				$("[name='wins-losses-container[2]']").show();
				break;
		}
	}

	function matchHtmlToDataForPlayerBox(playerNumber) {
		if(playerNumber === playerStates.FIRST || playerNumber === playerStates.SECOND) {
			$("[name = 'player-name[2]']").empty();
		}
	}

	function disconnectPlayer(playerNumber) {
		if(playerNumber === playerStates.FIRST || playerNumber === playerStates.SECOND) {
			if(currentState === gameplayStates.FULL || currentState === gameplayStates.WAITING) {
				myPlayer = playerStates.NOT;
				if(currentState === gameplayStates.FULL) {
					if(playerNumber === playerStates.FIRST) {
						playerOne.name = playerTwo.name;
						playerOne.choice = playerTwo.choice;
						playerOne.wins = playerTwo.wins;
						playerOne.losses = playerTwo.losses;
						if(myPlayer === playerStates.SECOND) {
							myPlayer = playerStates.FIRST;
						}
					}
				} else if(currentState === gameplayStates.WAITING) {
					playerOne.name = null;
					playerOne.choice = null;
					playerOne.wins = null;
					playerOne.losses = null;
				}

				playerTwo.name = null;
				playerTwo.choice = null;
				playerTwo.wins = null;
				playerTwo.losses = null;
				if(activePlayers > 0) {
					activePlayers--;
				}
				if(currentState === gameplayStates.FULL) {
					currentState = gameplayStates.WAITING;
				} else if(currentState === gameplayStates.WAITING) {
					currentState = gameplayStates.EMPTY;
				}
				updateDbWithVariables();
			}
		}
	}
	$("#disconnect-player-1").on("click", function() {
		disconnectPlayer(1);
	});
	$("#disconnect-player-2").on("click", function() {
		disconnectPlayer(2);
	});

	var connectedRef = database.ref(".info/connected");
	connectedRef.on("value", function(snap) {
	});
});
