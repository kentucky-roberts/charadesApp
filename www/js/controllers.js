angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicSlideBoxDelegate) {

$scope.onSwipeUp = function(){
    alert("You have just swipped up.");
  }

$scope.onDragUp = function(){
  alert("Dragged UP");
}


$scope.nextSlide = function() {
  $ionicSlideBoxDelegate.next();
}




})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})




.controller('CharadesGameGontroller', function($scope, $window, $interval, $timeout, $http, dataservice, PlayerService) {
  var vm = this;
        vm.secondsRemaining;
        vm.intervalHandle;
        vm.phrases = [];
        vm.cards = [];
        vm.turnCount = 0;
        vm.turnStep = 0;
        vm.team1Score = 0;
        vm.team2Score = 0;
        vm.activePlayer = activePlayer;
        vm.getPhrases = getPhrases;
        vm.activeTeam = "Team1";
        vm.teamColor = "bg-team1";



        getPhrases();

        function getPhrases() {
            
             $http.get('api/phrases.json').then(function(phraseData){
                vm.phrases = phraseData.data;
                vm.totalPhrases = vm.phrases.length;
                return;
            });
        }

        activePlayer();

        function activePlayer() {
            if (vm.turnCount === 0) {
                vm.activePlayer = vm.player1;
                return;
            } else {
                vm.activePlayer = function() {
                    vm.activePlayer = vm.player2;
                    return;
                }
            }
        }



        vm.init = function() {
            vm.maxValue = 10;
            vm.canDeal = false;
            vm.started = false;
            vm.showResults = false;
            vm.turnCount = 0;

        };

        vm.start = function () {
            vm.player1 = PlayerService.newPlayer('Ringo', 100, Team1);
            vm.player2 = PlayerService.newPlayer('Darth Vader', 50, Team2);
            vm.started = true;
            vm.canDeal = true;
            vm.showResults = false;
            vm.turnCount = 0;
            vm.activePhrase = 0; //begin pre-active-phrase process...
            return;
        };
        
       vm.stop = function(){
            alert("Game Has Stopped via CharadesGameController vm.stop()");
        };

        vm.deal = function () {
            //Initialize values each game
            vm.busted = false;
            vm.started = true;
            vm.canDeal = false;
            vm.showResults = false;

            //Shuffle before dealing
            vm.deck.reset();

            //Empty our dealt card array
            vm.playerCards.length = 0;

            //Deal the cards
            vm.hit(false);
        };


        /**
         * Adds a card to our hand and calculates value.
         * @param animate - Animate the card in
         */
        vm.hit = function (animate) {

            var card = vm.deck.deal();
            
            vm.dealCardToPlayer(card, animate, function(){
                vm.getHandValue();
            });


        };

        /**
         *
         * @param card
         * @param animate
         * @param callback
         */
        vm.dealCardToPlayer = function(card, animate, callback){
            if(animate) {
                card.hideValue = true;
                vm.playerCards.push(card);
                $timeout(function () {
                    card.hideValue = false;
                    callback();
                }, 250);
            }
            else{
                vm.playerCards.push(card);
                callback();
            }
        };


        vm.showPreSecretPhrase = function(){
            vm.activePhrase = "";
            vm.turnStep = 0;
            vm.selectActiveTeam();
        };
        vm.showSecretPhrase = function(){
            vm.activePhrase = "Jump like a duck";
            vm.turnStep = 1;
        };
        vm.startCountdown = function(){
            vm.turnStep = 2;
            vm.beginNewCountdown($scope, $interval);
        };
        vm.answeredCorrect = function(){
            vm.turnStep = 2;
            vm.stopTimer();
            vm.viewSecretPhraseSuccessMessage = true;
            vm.successMessage = "Success!  Your team has correctly guessed the 'Secret Phrase' please click the confirm button below to add a point to your team's score and begin the next turn.";
        };
        vm.answeredCorrectCanceled = function() {
            vm.turnStep = 2;
            vm.viewSecretPhraseSuccessMessage = false;
            vm.startTimer();
        };
        vm.answeredCorrectConfirmed = function(){
            vm.turnStep = 2;
            // TODO ... REPLACE BELOW WITH ->  vm.getActivePlayer(); vm.game.activePlayer.score += 1;
            //vm.game.player1.score += 1;
            // end TODO
            vm.stopTimer();
            vm.resetTimer();
            //vm.addTeam1Point();
            vm.addPointToActiveTeam();
            vm.nextTurn();
        };
        vm.stealPoint = function(){
            // TODO   vm.secondsRemaining = 29;
            vm.turnStep = 3;
            vm.viewBounusRoundScreen = true;
            vm.startBounusRound();
            // TODO add new timer countdown here.  rtn true then vm.addTeam2Point();
            //vm.addTeam2Point();
        };
        vm.nextStep = function(){
            vm.turnStep += 1;
        };
        vm.addTeam1Point = function() {
            vm.team1Score += 1;
            
        };
        vm.addTeam2Point = function() {
            vm.team2Score += 1;

        };
        vm.addPointToActiveTeam = function() {
            
            vm.selectActiveTeam();
            
            if (vm.activeTeam === "Team1"){
                vm.addTeam1Point();
            } else {
                vm.addTeam2Point();
            }
        };

        vm.nextTurn = function(){

            if (vm.team1Score < 10 && vm.team2Score < 10){

                vm.gameOver = false;
                vm.turnStep = 0;
                vm.turnCount += 1; 
                vm.selectActiveTeam();
                vm.resetTurn();
                vm.showPreSecretPhrase();
            } else {
                vm.gameOver = true;
                alert("Game Over!");
                vm.resetTurn();
            }

        };

        vm.selectActiveTeam = function() {

            if (vm.turnCount % 2 == 0) {

                vm.activeTeam = "Team1";
                vm.teamColor = "bg-team1";
                return;

            } else {
                vm.activeTeam = "Team2";
                vm.teamColor = "bg-team2";
                return;
            }

        };

        vm.resetTurn = function() {
            vm.stopTimer();
            vm.resetTimer();
            vm.secondsRemaining = 59;
            vm.timeExpired = false;
        };
            

     

        vm.beginNewCountdown = function($scope, $interval) {

            vm.format = 'M/d/yy h:mm:ss ss';
            vm.secondsRemaining = 59;
            vm.bounusSecondsRemaining = 15;

            var stop;
            
            vm.startTimer = function() {
              if ( angular.isDefined(stop) ) return;
              stop = $interval(function() {
                
                if (vm.secondsRemaining > 0) {
                 
                  vm.secondsRemaining = vm.secondsRemaining - 1;
                  
                  } else {
                    vm.stopTimer();
                    //vm.stealPoint();
                    vm.resetTimer();
                    vm.nextStep();
                  }
                }, 100);// $interval
            };

            vm.startBounusRound = function() {
              if ( angular.isDefined(stop) ) return;
              stop = $interval(function() {
                
                if (vm.bounusSecondsRemaining > 0) {
                 
                  vm.bounusSecondsRemaining = vm.bounusSecondsRemaining - 1;
                  
                  } else {

                    vm.stopTimer();
                    vm.resetTimer();
                    vm.nextTurn();

                  }
                }, 100);// $interval
            };

            vm.stopTimer = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };

            vm.resetTimer = function() {
                vm.secondsRemaining = 59;
                //vm.bounusSecondsRemaining = 15;
            };

            vm.resetTimerStealPoint = function() {
                vm.secondsRemaining = 15
            };

            vm.showTimeExpiredMessage = function() {
                vm.timeExpired = true;
                vm.timeExpiredMessage = "Your time has expired!!  Your team is awarded 0 points, nice job sucking.  Click 'Next Turn' button below to continue game.";

            };
            
            $scope.$on('$destroy', function() {
                vm.stopTimer();
            });

            vm.startTimer();



        };

    vm.init();
})






.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
