angular.module('app.directives', [])

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
.directive('charadesGame', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/game/game.html',

  };
})