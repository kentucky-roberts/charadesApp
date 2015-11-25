// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.contrib.ui.cards', 'ionic.service.core', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.directive('noScroll', function($document) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})


.controller('CardsCtrl', function($scope, $ionicSwipeCardDelegate) {


  var cardTypes = [{
    title: 'Swipe down to clear the card',
    phrase: 'Donkey Punch',
    xLevel: 10,
    image: 'img/pic.png'
  }, {
    title: 'Where is this?',
    phrase: 'Ride Em Cowgirl',
    xLevel: 10,
    image: 'img/pic.png'
  }, {
    title: 'What kind of grass is this?',
    phrase: 'Party Like An Animal',
    xLevel: 10,
    image: 'img/pic2.png'
  }, {
    title: 'What beach is this?',
    phrase: 'Poker In The Front, Lick Her In The Rear',
    xLevel: 10,
    image: 'img/pic3.png'
  }, {
    title: 'What kind of clouds are these?',
    phrase: 'Horney School Girl',
    xLevel: 10,
    image: 'img/pic4.png'
  }];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0, 0);

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
  }


  
})

.controller('CardCtrl', function($scope, $ionicSwipeCardDelegate) {
  $scope.goAway = function() {
    var card = $ionicSwipeCardDelegate.getSwipeableCard($scope);
    card.swipe();
  };
});

