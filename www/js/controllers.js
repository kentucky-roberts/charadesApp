angular.module('app.controllers', [])

.controller('DashCtrl', function($scope, $ionicSlideBoxDelegate) {

    $scope.onSwipeUp = function(){
        alert("You have just swipped up.");
      };

    $scope.onDragUp = function(){
      alert("Dragged UP");
    };
    
    $scope.swipe = function($event) {
        console.log($event);
    };

    $scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
    };

})




.controller('GameController', ['$scope', '$window', '$interval', '$timeout', '$ionicModal', '$http', '$ionicSwipeCardDelegate',
    function($scope, $window, $interval, $timeout, $ionicModal, $http, $ionicSwipeCardDelegate) {

        $scope.secondsRemaining;
        $scope.intervalHandle;
        $scope.phrases = [];
        $scope.cards = [];
        $scope.turnCount = 0;
        $scope.turnStep = 0;
        $scope.team1Score = 0;
        $scope.team2Score = 0;
        $scope.activePlayer = activePlayer;
        $scope.getPhrases = getPhrases;
        $scope.activeTeam = "Team1";
        $scope.teamColor = "bg-team1";



        getPhrases();

        function getPhrases() {
            
             $http.get('api/card_types.json').then(function(phraseData){
                $scope.phrases = phraseData.data;
                $scope.totalPhrases = $scope.phrases.length;
                return;
            });
        }

        activePlayer();

        function activePlayer() {
            if ($scope.turnCount === 0) {
                $scope.activePlayer = $scope.player1;
                return;
            } else {
                $scope.activePlayer = function() {
                    $scope.activePlayer = $scope.player2;
                    return;
                }
            }
        }



        $scope.init = function() {
            $scope.maxValue = 10;
            $scope.canDeal = false;
            $scope.started = false;
            $scope.showResults = false;
            $scope.turnCount = 0;

        };

        $scope.start = function () {
            //$scope.player1 = PlayerService.newPlayer('Ringo', 100, Team1);
            //$scope.player2 = PlayerService.newPlayer('Darth Vader', 50, Team2);
            $scope.started = true;
            $scope.canDeal = true;
            $scope.showResults = false;
            $scope.turnCount = 0;
            $scope.activePhrase = 0; //begin pre-active-phrase process...
            return;
        };
        
       $scope.stop = function(){
            alert("Game Has Stopped via CharadesGameController $scope.stop()");
        };

        $scope.deal = function () {
            //Initialize values each game
            $scope.busted = false;
            $scope.started = true;
            $scope.canDeal = false;
            $scope.showResults = false;

            //Shuffle before dealing
            $scope.deck.reset();

            //Empty our dealt card array
            $scope.playerCards.length = 0;

            //Deal the cards
            $scope.hit(false);
        };


        /**
         * Adds a card to our hand and calculates value.
         * @param animate - Animate the card in
         */
        $scope.hit = function (animate) {

            var card = $scope.deck.deal();
            
            $scope.dealCardToPlayer(card, animate, function(){
                $scope.getHandValue();
            });


        };

        /**
         *
         * @param card
         * @param animate
         * @param callback
         */
        $scope.dealCardToPlayer = function(card, animate, callback){
            if(animate) {
                card.hideValue = true;
                $scope.playerCards.push(card);
                $timeout(function () {
                    card.hideValue = false;
                    callback();
                }, 250);
            }
            else{
                $scope.playerCards.push(card);
                callback();
            }
        };


        $scope.showPreSecretPhrase = function(){
            $scope.activePhrase = "";
            $scope.turnStep = 0;
            $scope.selectActiveTeam();
        };
        $scope.showSecretPhrase = function(){
            $scope.activePhrase = "Jump like a duck";
            $scope.turnStep = 1;
        };
        $scope.startCountdown = function(){
            $scope.turnStep = 2;
            $scope.beginNewCountdown($scope, $interval);
        };
        $scope.answeredCorrect = function(){
            $scope.turnStep = 2;
            $scope.stopTimer();
            $scope.viewSecretPhraseSuccessMessage = true;
            $scope.successMessage = "Success!<br> Your team has correctly guessed the 'Secret Phrase' please click the confirm button below to add a point to your team's score and begin the next turn.";
        };
        $scope.answeredCorrectCanceled = function() {
            $scope.turnStep = 2;
            $scope.viewSecretPhraseSuccessMessage = false;
            $scope.startTimer();
        };
        $scope.answeredCorrectConfirmed = function(){
            $scope.turnStep = 2;
            // TODO ... REPLACE BELOW WITH ->  $scope.getActivePlayer(); $scope.game.activePlayer.score += 1;
            //$scope.game.player1.score += 1;
            // end TODO
            $scope.stopTimer();
            $scope.resetTimer();
            //$scope.addTeam1Point();
            $scope.addPointToActiveTeam();
            $scope.nextTurn();
        };
        $scope.stealPoint = function(){
            // TODO   $scope.secondsRemaining = 29;
            $scope.turnStep = 3;
            $scope.viewBounusRoundScreen = true;
            $scope.startBounusRound();
            // TODO add new timer countdown here.  rtn true then $scope.addTeam2Point();
            //$scope.addTeam2Point();
        };
        $scope.nextStep = function(){
            alert("Next Step");
            $scope.turnStep += 1;
        };
        $scope.addTeam1Point = function() {
            $scope.team1Score += 1;
            
        };
        $scope.addTeam2Point = function() {
            $scope.team2Score += 1;

        };
        $scope.addPointToActiveTeam = function() {
            
            $scope.selectActiveTeam();
            
            if ($scope.activeTeam === "Team1"){
                $scope.addTeam1Point();
            } else {
                $scope.addTeam2Point();
            }
        };
        $scope.nextTurn = function(){
            if ($scope.team1Score < 10 && $scope.team2Score < 10){
                $scope.gameOver = false;
                $scope.turnStep = 0;
                $scope.turnCount += 1; 
                $scope.selectActiveTeam();
                $scope.resetTurn();
                $scope.showPreSecretPhrase();
            } else {
                $scope.gameOver = true;
                alert("Game Over!");
                $scope.resetTurn();
            }
        };

        $scope.selectActiveTeam = function() {

            if ($scope.turnCount % 2 == 0) {

                $scope.activeTeam = "Team1";
                $scope.teamColor = "bg-team1";
                return;

            } else {
                $scope.activeTeam = "Team2";
                $scope.teamColor = "bg-team2";
                return;
            }

        };

        $scope.resetTurn = function() {
            //$scope.stopTimer();
            $scope.resetTimer();
            $scope.secondsRemaining = 59;
            $scope.timeExpired = false;
        };
            
        $scope.beginNewCountdown = function($scope, $interval) {

            $scope.format = 'M/d/yy h:mm:ss ss';
            $scope.secondsRemaining = 59;
            $scope.bounusSecondsRemaining = 15;

            var stop;
            
            $scope.startTimer = function() {
              if ( angular.isDefined(stop) ) return;
              stop = $interval(function() {
                
                if ($scope.secondsRemaining > 0) {
                 
                  $scope.secondsRemaining = $scope.secondsRemaining - 1;
                  
                  } else {
                    $scope.stopTimer();
                    //$scope.stealPoint();
                    $scope.resetTimer();
                    $scope.nextStep();
                  }
                }, 100);// $interval
            };

            $scope.startBounusRound = function() {
              if ( angular.isDefined(stop) ) return;
              stop = $interval(function() {
                
                if ($scope.bounusSecondsRemaining > 0) {
                 
                  $scope.bounusSecondsRemaining = $scope.bounusSecondsRemaining - 1;
                  
                  } else {

                    $scope.stopTimer();
                    $scope.resetTimer();
                    $scope.nextTurn();

                  }
                }, 100);// $interval
            };

            $scope.stopTimer = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };

            $scope.resetTimer = function() {
                $scope.secondsRemaining = 59;
                //$scope.bounusSecondsRemaining = 15;
            };

            $scope.resetTimerStealPoint = function() {
                $scope.secondsRemaining = 15
            };

            $scope.showTimeExpiredMessage = function() {
                $scope.timeExpired = true;
                $scope.timeExpiredMessage = "Your time has expired!!  Your team is awarded 0 points, nice job sucking.  Click 'Next Turn' button below to continue game.";

            };
            
            $scope.$on('$destroy', function() {
                $scope.stopTimer();
            });

            $scope.startTimer();

            var stopActions = function ($event) {
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
                if ($event.preventDefault) {
                    $event.preventDefault();
                }
                $event.cancelBubble = true;
                $event.returnValue = false;
            };




        };

    $scope.init();
}])








.controller('CardsCtrl', function($scope, $window, $interval, $timeout, $ionicSwipeCardDelegate, $http, $ionicModal, $timeout, $ionicLoading, $ionicPopover, $ionicBackdrop) {

    
    $scope.showLoading = function() {
      $ionicLoading.show(); //options default to values in $ionicLoadingConfig
    };

    $scope.showLoading();
    $scope.secondsRemaining;
    $scope.intervalHandle;
    $scope.phrases = [];
    $scope.cards = [];
    $scope.turnCount = -1;
    $scope.turnStep = 0;
    $scope.team1Score = 0;
    $scope.team2Score = 0;
    //$scope.activePlayer = activePlayer;
    //$scope.getPhrases = getPhrases;
    $scope.activeTeam = "";
    $scope.teamColor = "light";
    $scope.gameStarted = false;

    $scope.init = function() {
        $scope.maxValue = 10;
        $scope.canDeal = false;
        $scope.started = false;
        $scope.showResults = false;
        $scope.turnCount = 0;
        $scope.timeExpired = false;
    };

    $scope.start = function () {
        //$scope.player1 = PlayerService.newPlayer('Ringo', 100, Team1);
        //$scope.player2 = PlayerService.newPlayer('Darth Vader', 50, Team2);
        $scope.started = true;
        $scope.canDeal = true;
        $scope.showResults = false;
        $scope.turnCount = 0;
        $scope.activePhrase = ""; //begin pre-active-phrase process...
        $scope.nextTurn();
        //$scope.addCard();
        return;
    };

    $scope.stop = function(){
        alert("Game Has Stopped via CharadesGameController $scope.stop()");
    };

    

  var cardTypes = [{
    title: 'Swipe down to clear the card',
    phrase: 'Donkey Punch',
    xLevel: 10,
    image: 'img/pic.png'
  }, {
    title: 'Ride Em Cowgirl',
    phrase: 'Ride Em Cowgirl',
    xLevel: 10,
    image: 'img/pic.png'
  }, {
    title: 'Party Like An Animal',
    phrase: 'Party Like An Animal',
    xLevel: 10,
    image: 'img/pic2.png'
  }, {
    title: 'Poker In The Front, Lick Her In The Rear',
    phrase: 'Poker In The Front, Lick Her In The Rear',
    xLevel: 10,
    image: 'img/pic3.png'
  }, {
    title: 'Horney School Girl',
    phrase: 'Horney School Girl',
    xLevel: 10,
    image: 'img/pic4.png'
  }];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0, 0);
  console.log('Cards', $scope.cards);

  $scope.cardSwiped = function(index) {
    $scope.addCard();
  };

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  };

  /*  $scope.addOptionalCards = function() {
    var newCardA = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCardA.id = Math.random();
    var newCardB = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCardB.id = Math.random();
    var newCardC = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCardC.id = Math.random();
    var newCards = function () {
        newCardA += newCardB += newCardC;
    }
    console.log(newCards);
    $scope.cards.push(angular.extend({}, newCards));
  }; */

  $scope.onSwipeUp = function(index){
    console.log("You have just swipped up.");
    if ($scope.turnStep === 0){

         $scope.cardDestroyed(index);
        $( "#start-card" ).addClass( "hidden" );
        $scope.start();

      }

      if ($scope.turnStep === 3) {
        $scope.cardDestroyed(index);
        $( "#next-turn-card" ).addClass( "hidden" );
        $scope.nextTurn();
      }
        
      $scope.nextTurn();

  };


  $scope.onHold = function(index){
    $scope.showSecretPhrase();
    
  };
  $scope.onDragDown = function(index){
    
  };


  $scope.onSwipeDown = function(index){
    console.log("You have just swipped DOWN.");
    
      if ($scope.turnStep === 0){

        $scope.cardDestroyed(index);
        $( "#start-card" ).addClass( "hidden" );
        $scope.start();
      }

      $scope.addCard(); 
      
  };

  $scope.onSwipeRight = function(index) {
      console.log("You have swipped Right");
      $scope.addCard();
  };

  $scope.onSwipeLeft = function(index) {
      console.log("You have swipped Left");
     $scope.addCard();
   };



$scope.showPreSecretPhrase = function(){
    $scope.selectActiveTeam();
    $scope.activePhrase = "";
    $scope.turnStep = 0;
   // $( ".pre-secret-phrase" ).addClass( " flipInY" );
};
$scope.showSecretPhrase = function(){
    $scope.activePhrase = "Jump like a duck";
    $scope.turnStep = 1;
   // $( ".secret-phrase" ).addClass( " flipInY" );
};
$scope.startCountdown = function(){
    $scope.turnStep = 2;
    $scope.beginNewCountdown($scope, $interval);
};
$scope.answeredCorrect = function(){
    $scope.turnStep = 2;
    $scope.stopTimer();
    $scope.viewSecretPhraseSuccessMessage = true;
    $scope.openModal();
    $scope.successMessage = "Success!  Your team has correctly guessed the 'Secret Phrase' please click the confirm button below to add a point to your team's score and begin the next turn.";
};
$scope.answeredCorrectCanceled = function() {
    $scope.turnStep = 2;
    $scope.closeModal();
    $scope.viewSecretPhraseSuccessMessage = false;
    $scope.startTimer();
};
$scope.answeredCorrectConfirmed = function(){
    $scope.turnStep = 2;
    $scope.viewSecretPhraseSuccessMessage = false;
    $scope.closeModal();
    $scope.stopTimer();
    $scope.resetTimer();
    $scope.addPointToActiveTeam();
    //$scope.nextTurn();
    //$scope.readyNextTurn();
};
$scope.stealPoint = function(){
    $scope.turnStep = 3;
    $scope.viewBounusRoundScreen = true;
    $scope.startBounusRound();
};
$scope.nextStep = function(){
    alert("Next Step");
    $scope.turnStep += 1;


};
$scope.addTeam1Point = function() {
    $scope.team1Score += 1;
    $scope.readyNextTurn();
};
$scope.addTeam2Point = function() {
    $scope.team2Score += 1;
    $scope.readyNextTurn();
};





$scope.hideResults = function() {
    $scope.showResults = false;
    $scope.results = "";
}

$scope.addPointToActiveTeam = function() {
    
    $scope.selectActiveTeam();
    
    if ($scope.activeTeam === "Team1"){
        $scope.addTeam1Point();
        
    } else {
        $scope.addTeam2Point();
        
    }
};

$scope.readyNextTurn = function(){
    $scope.showResults = false;
    $scope.timeExpired = false;
    $scope.cardDestroyed(); 
    $scope.turnStep = 3;
};

$scope.nextTurn = function(){
    if ($scope.team1Score < 10 && $scope.team2Score < 10){
        $scope.gameOver = false;
        $scope.turnStep = 0;
        $scope.turnCount += 1; 
        //$scope.selectActiveTeam();
        //$scope.resetTurn();
        $scope.cardDestroyed();
        $scope.addCard();
        $scope.showPreSecretPhrase();
    } else {
        $scope.gameOver = true;
        alert("Game Over!");
        $scope.resetTurn();
    }
};

$scope.selectActiveTeam = function() {

    if ($scope.turnCount % 2 == 0 && $scope.turnCount != 1) {

        $scope.activeTeam = "Team1";
        $scope.teamColor = "positive";
        return;

    } else {
        $scope.activeTeam = "Team2";
        $scope.teamColor = "assertive";
        return;
    }

};

$scope.resetTurn = function() {
    //$scope.stopTimer();
    $scope.resetTimer();
    $scope.secondsRemaining = 59;
    $scope.timeExpired = false;
};
    
$scope.beginNewCountdown = function($scope, $interval) {

    $scope.format = 'M/d/yy h:mm:ss ss';
    $scope.secondsRemaining = 59;
    $scope.bounusSecondsRemaining = 15;

    var stop;
    
    $scope.startTimer = function() {
     

      if ( angular.isDefined(stop) ) return;
      stop = $interval(function() {
        
        if ($scope.secondsRemaining > 0) {
         
          $scope.secondsRemaining = $scope.secondsRemaining - 1;
          
          } else {
            $scope.stopTimer();
            //$scope.stealPoint();
            $scope.resetTimer();
            $scope.showTimeExpiredMessage();
            $scope.readyNextTurn();
          }
        }, 100);// $interval
        
    };


    
    $scope.startBounusRound = function() {
      if ( angular.isDefined(stop) ) return;
      stop = $interval(function() {
        if ($scope.bounusSecondsRemaining > 0) {
          $scope.bounusSecondsRemaining = $scope.bounusSecondsRemaining - 1;
          } else {
            $scope.stopTimer();
            $scope.resetTimer();
            $scope.readyNextTurn();
          }
        }, 100);// $interval
    };

    $scope.stopTimer = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.resetTimer = function() {
        $scope.secondsRemaining = 0;
        $scope.secondsRemaining = 59;
        //$scope.bounusSecondsRemaining = 15;
    };

    $scope.resetTimerStealPoint = function() {
        $scope.secondsRemaining = 15
    };

    $scope.showTimeExpiredMessage = function() {
        $ionicBackdrop.retain();
        $scope.showResults = true;
        $scope.timeExpired = true;
        $scope.timeExpiredMessage = "Your time has expired!!  Your team is awarded 0 points.";
        $timeout(function() {
            $scope.timeExpiredMessage = "";
            $scope.showResults = false;
            $scope.timeExpired = false;
          $ionicBackdrop.release();
        }, 3000);
      };



    // .fromTemplate() method
    var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';

    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });


      $scope.openPopover = function($event) {
        $scope.popover.show($event);
      };
      $scope.closePopover = function() {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });
      // Execute action on hide popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });

      


  $ionicModal.fromTemplateUrl('templates/modals/success-modal.html', {
    scope: $scope,
    animation: 'pop-in'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {

    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });




    $scope.$on('$destroy', function() {
        $scope.stopTimer();
    });

    $scope.startTimer();

    
    $scope.init();
    };

  $scope.hideLoading = function() {
    $timeout(function() {
      $ionicLoading.hide();
    }, 1000);
  };
  $scope.hideLoading(); 
})

.controller('CardCtrl', function($scope, $ionicSwipeCardDelegate) {
  $scope.goAway = function() {
    var card = $ionicSwipeCardDelegate.getSwipeableCard($scope);
    card.swipe();
  };


})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});