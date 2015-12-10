
angular.module('app.animations', [])
/*.animation('.secret-phrase', function () {
    return {
        addClass: function (element, className, done) {
            if (className === 'hidden') {
                jQuery(element)
                    .css({
                    opacity: 1
                })
                    .animate({
                    opacity: 0
                }, 500, done);
            } else {
                done();
            }
        },
        removeClass: function (element, className, done) {
            if (className === 'hidden') {
                jQuery(element)
                    .css({
                    opacity: 0
                })
                    .animate({
                    opacity: 1
                }, 500, done);
            } else {
                done();
            }
        }
    }
});


.animation('.fold-animation', ['$animateCss', function($animateCss) {
  return {
    enter: function(element, doneFn) {
      var height = element[0].offsetHeight;
      return $animateCss(element, {
        addClass: 'red large-text pulse-twice',
        easing: 'ease-out',
        from: { height:'0px' },
        to: { height:height + 'px' },
        duration: 5 // one second
      });
    }
  }
}]);*/