(function(ionic) {

  // Get transform origin poly
  var d = document.createElement('div');
  var transformKeys = ['webkitTransformOrigin', 'transform-origin', '-webkit-transform-origin', 'webkit-transform-origin',
              '-moz-transform-origin', 'moz-transform-origin', 'MozTransformOrigin', 'mozTransformOrigin'];

  var TRANSFORM_ORIGIN = 'webkitTransformOrigin';
  for(var i = 0; i < transformKeys.length; i++) {
    if(d.style[transformKeys[i]] !== undefined) {
      TRANSFORM_ORIGIN = transformKeys[i];
      break;
    }
  }

  var transitionKeys = ['webkitTransition', 'transition', '-webkit-transition', 'webkit-transition',
              '-moz-transition', 'moz-transition', 'MozTransition', 'mozTransition'];
  var TRANSITION = 'webkitTransition';
  for(var i = 0; i < transitionKeys.length; i++) {
    if(d.style[transitionKeys[i]] !== undefined) {
      TRANSITION = transitionKeys[i];
      break;
    }
  }

  var SwipeableCardController = ionic.views.View.inherit({
    initialize: function(opts) {
      this.cards = [];

      var ratio = window.innerWidth / window.innerHeight;

      this.maxWidth = window.innerWidth - (opts.cardGutterWidth || 0);
      this.maxHeight = opts.height || 300;
      this.cardGutterWidth = opts.cardGutterWidth || 10;
      this.cardPopInDuration = opts.cardPopInDuration || 400;
      this.cardAnimation = opts.cardAnimation || 'pop-in';
    },
    /**
     * Push a new card onto the stack.
     */
    pushCard: function(card) {
      var self = this;

      this.cards.push(card);
      this.beforeCardShow(card);

      card.transitionIn(this.cardAnimation);
      setTimeout(function() {
        card.disableTransition(self.cardAnimation);
      }, this.cardPopInDuration + 100);
    },
    /**
     * Set up a new card before it shows.
     */
    beforeCardShow: function() {
      var nextCard = this.cards[this.cards.length-1];
      if(!nextCard) return;

      // Calculate the top left of a default card, as a translated pos
      var topLeft = window.innerHeight / 2 - this.maxHeight/2;
      console.log(window.innerHeight, this.maxHeight);

      var cardOffset = Math.min(this.cards.length, 3) * 5;

      // Move each card 5 pixels down to give a nice stacking effect (max of 3 stacked)
      nextCard.setPopInDuration(this.cardPopInDuration);
      nextCard.setZIndex(this.cards.length);
    },
    /**
     * Pop a card from the stack
     */
    popCard: function(animate) {
      var card = this.cards.pop();
      if(animate) {
        card.swipe();
      }
      return card;
    }
  });

  var SwipeableCardView = ionic.views.View.inherit({
    /**
     * Initialize a card with the given options.
     */
    initialize: function(opts) {
      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.parentWidth = this.el.parentNode.offsetWidth;
      this.width = this.el.offsetWidth;

      this.startX = this.startY = this.x = this.y = 0;

      this.bindEvents();
    },

    /**
     * Set the X position of the card.
     */
    setX: function(x) {
      this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + x + 'px,' + this.y + 'px, 0)';
      this.x = x;
      this.startX = x;
    },

    /**
     * Set the Y position of the card.
     */
    setY: function(y) {
      this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + 'px,' + y + 'px, 0)';
      this.y = y;
      this.startY = y;
    },

    /**
     * Set the Z-Index of the card
     */
    setZIndex: function(index) {
      this.el.style.zIndex = index;
    },

    /**
     * Set the width of the card
     */
    setWidth: function(width) {
      this.el.style.width = width + 'px';
    },

    /**
     * Set the height of the card
     */
    setHeight: function(height) {
      this.el.style.height = height + 'px';
    },

    /**
     * Set the duration to run the pop-in animation
     */
    setPopInDuration: function(duration) {
      this.cardPopInDuration = duration;
    },

    /**
     * Transition in the card with the given animation class
     */
    transitionIn: function(animationClass) {
      var self = this;

      this.el.classList.add(animationClass + '-start');
      this.el.classList.add(animationClass);
      this.el.style.display = 'block';
      setTimeout(function() {
        self.el.classList.remove(animationClass + '-start');
      }, 100);
    },

    /**
     * Disable transitions on the card (for when dragging)
     */
    disableTransition: function(animationClass) {
      this.el.classList.remove(animationClass);
    },

    /**
     * Swipe a card out programtically
     */
    swipe: function() {
      this.transitionOut();
    },
    
    /**
     * Snap the card back to its original position
     */
    snapBack: function() {
      this.onSnapBack(this.x, this.y, this.rotationAngle);
    },

    isUnderThreshold: function() {
      //return true;
      return Math.abs(this.thresholdAmount) < 0.4;
    },
    /**
     * Fly the card out or animate back into resting position.
     */
    transitionOut: function(e) {
      var self = this;

      if(this.isUnderThreshold()) {
        self.onSnapBack(this.x, this.y, this.rotationAngle);
        return;
      }

      self.onTransitionOut(self.thresholdAmount);
      
      var angle = Math.atan(e.gesture.deltaX / e.gesture.deltaY);

      var dir = this.thresholdAmount < 0 ? -1 : 1;
      var targetX;
      if(this.x > 0) {
        targetX = (this.parentWidth / 2) + (this.width);
      } else {
        targetX = - (this.parentWidth + this.width);
      }

      // Target Y is just the "opposite" side of the triangle of targetX as the adjacent edge (sohcahtoa yo)
      var targetY = targetX / Math.tan(angle);

      if(this.y < 0) {
        this.el.style[TRANSITION] = '-webkit-transform 0.2s ease-in-out';
        this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + ',' + (this.startY) + 'px, 0)';
        setTimeout(function() {
          self.el.style[TRANSITION] = 'none';
        }, 200);
      } else {
        // Fly out
        var rotateTo = (this.rotationAngle + (this.rotationDirection * 0.6)) || (Math.random() * 0.4);
        var duration = this.rotationAngle ? 0.2 : 0.5;
        this.el.style[TRANSITION] = '-webkit-transform ' + duration + 's ease-in-out';
        this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + ',' + (window.innerHeight * 1.5) + 'px, 0) rotate(' + rotateTo + 'rad)';
        this.onSwipe && this.onSwipe();

        // Trigger destroy after card has swiped out
        setTimeout(function() {
          self.onDestroy && self.onDestroy();
        }, duration * 1000);
      }
    },

    /**
     * Bind drag events on the card.
     */
    bindEvents: function() {
      var self = this;
      ionic.onGesture('dragstart', function(e) {
                /*
        var cx = window.innerWidth / 2;
        if(e.gesture.touches[0].pageX < cx) {
          self._transformOriginRight();
        } else {
          self._transformOriginLeft();
        }
        */
        ionic.requestAnimationFrame(function() { self._doDragStart(e) });
      }, this.el);

      ionic.onGesture('drag', function(e) {
        ionic.requestAnimationFrame(function() { self._doDrag(e) });
      }, this.el);

      ionic.onGesture('dragend', function(e) {
        ionic.requestAnimationFrame(function() { self._doDragEnd(e) });
      }, this.el);
    },

    // Rotate anchored to the left of the screen
    _transformOriginLeft: function() {
      this.el.style[TRANSFORM_ORIGIN] = 'left center';
      this.rotationDirection = 1;
    },

    _transformOriginRight: function() {
      this.el.style[TRANSFORM_ORIGIN] = 'right center';
      this.rotationDirection = -1;
    },

    _doDragStart: function(e) {
      var width = this.el.offsetWidth;
      var point = window.innerWidth / 2 + this.rotationDirection * (width / 2)
      var distance = Math.abs(point - e.gesture.touches[0].pageX);// - window.innerWidth/2);
      console.log(distance);

      this.touchDistance = distance * 10;

      console.log('Touch distance', this.touchDistance);//this.touchDistance, width);
    },

    _doDrag: function(e) {
      var oY = e.gesture.deltaY / 3;

      this.rotationAngle = Math.atan(oY/this.touchDistance) * this.rotationDirection;

      if(e.gesture.deltaY < 0) {
        this.rotationAngle = 0;
      }

      //this.y = this.startY + (e.gesture.deltaY * 0.4);

      //this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + 'px, ' + this.y  + 'px, 0) rotate(' + (this.rotationAngle || 0) + 'rad)';
    
      
      var oX = e.gesture.deltaX / -1000;

      this.rotationAngle = Math.atan(oX/this.touchDistance) * this.rotationDirection;

      if(e.gesture.deltaX < 0) {
        this.rotationAngle = 0;
      }

      this.y = this.startX + (e.gesture.deltaY * 0.4);
      this.x = this.startX + (e.gesture.deltaX * 0.4);

      //this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + 'px, ' + this.y  + 'px, 0) rotate(' + (this.rotationAngle || 0) + 'rad)';
    




      //var o = e.gesture.deltaX / -1000;

      //this.rotationAngle = Math.atan(o);

      //this.x = this.startX + (e.gesture.deltaX * 0.4);
      //this.y = this.startY + (e.gesture.deltaY * 0.4);

      this.el.style.transform = this.el.style.webkitTransform = 'translate3d(' + this.x + 'px, ' + this.y  + 'px, 0) rotate(' + (this.rotationAngle || 0) + 'rad)';


      this.thresholdAmount = (this.x / (this.parentWidth/2));

      var self = this;
      setTimeout(function() {
        //self.onPartialSwipe(self.thresholdAmount);
      });
    },
    _doDragEnd: function(e) {
      this.transitionOut(e);
    }
  });


  angular.module('ionic.contrib.ui.cards', ['ionic'])

  .directive('swipeCard', ['$timeout', function($timeout) {


    /**
     * A simple non-linear fade function for the text on each card
     */
    var fadeFn = function(t) {
      // Speed up time to ramp up quickly
      t = Math.min(1, t * 3);

      // This is a simple cubic bezier curve.
      // http://cubic-bezier.com/#.11,.67,.41,.99
      var c1 = 0.11,
          c2 = 0.67,
          c3 = 0.41,
          c4 = 0.99;

      return Math.pow((1 - t), 3)*c1 + 3*Math.pow((1 -  t), 2)*t*c2 + 3*(1 - t)*t*t*c3 + Math.pow(t, 3)*c4;
    };


    return {
      restrict: 'E',
      template: '<div class="swipe-card" ng-transclude></div>',
      require: '^swipeCards',
      transclude: true,
      scope: {
        onCardSwipe: '&',
        onSwipeLeft: '&',
        onSwipeRight: '&',
        onTransitionLeft: '&',
        onTransitionRight: '&',
        onTransitionOut: '&',
        onPartialSwipe: '&',
        onSnapBack: '&',
        onDestroy: '&'
      },
//      link: function($scope, $element, $attr, swipeCards) {
  //      var el = $element[0];
      compile: function(element, attr, swipeCards) {
        return function($scope, $element, $attr, swipeCards) {
          var el = $element[0];
          var leftText = el.querySelector('.no-text');
          var rightText = el.querySelector('.yes-text');
          
          // Force hardware acceleration for animation - better performance on first touch
          el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';

        // Instantiate our card view
        var swipeableCard = new SwipeableCardView({
          el: el,
            leftText: leftText,
            rightText: rightText,

            
            onSwipeRight: function() {
              $timeout(function() {
                $scope.onSwipeRight();
              });
            },
            onSwipeLeft: function() {
              $timeout(function() {
                $scope.onSwipeLeft();
              });
            },
            onTransitionRight: function() {
              $timeout(function() {
                $scope.onTransitionRight();
              });
            },
            onTransitionLeft: function() {
              $timeout(function() {
                $scope.onTransitionLeft();
              });
            },
            onTransitionOut: function(amt) {
              if (amt < 0) {
                swipeableCard.onTransitionLeft();
              } else {
                swipeableCard.onTransitionRight();
              }
              $timeout(function() {
                $scope.onTransitionOut({amt: amt});
              });
            },
            onDestroy: function() {
              $timeout(function() {
                $scope.onDestroy();
              });
            },
            onSnapBack: function(startX, startY, startRotation) {
              var leftText = el.querySelector('.yes-text');
              var rightText = el.querySelector('.no-text');

              var animation = collide.animation({
                // 'linear|ease|ease-in|ease-out|ease-in-out|cubic-bezer(x1,y1,x2,y2)',
                // or function(t, duration),
                // or a dynamics configuration (see below)
                duration: 500,
                percent: 0,
                reverse: false
              })

              .easing({
                type: 'spring',
                frequency: 15,
                friction: 250,
                initialForce: false
              }) 

              .on('step', function(v) {
                //Have the element spring over 400px
                el.style.transform = el.style.webkitTransform = 'translate3d(' + (startX - startX*v) + 'px, ' + (startY - startY*v) + 'px, 0) rotate(' + (startRotation - startRotation*v) + 'rad)';
                if (rightText) rightText.style.opacity = 0;
                if (leftText) leftText.style.opacity = 0;
              })
              .start();

              $timeout(function() {
                $scope.onSnapBack();
              });

              /*
              animateSpringViaCss(el, 0, 0.5, 50, 700, 10, function (x) {
                return el.style.transform = el.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
              });
              */
            },
        });
        //$scope.$parent.swipeCard = swipeableCard;

        swipeCards.swipeController.pushCard(swipeableCard);

       }
      }
    }
  }])

  .directive('swipeCards', ['$rootScope', function($rootScope) {
    return {
      restrict: 'E',
      template: '<div class="swipe-cards" ng-transclude></div>',
      transclude: true,
      scope: true,
      controller: function($scope, $element) {
        var swipeController = new SwipeableCardController({
        });

        $rootScope.$on('swipeCard.pop', function(isAnimated) {
          swipeController.popCard(isAnimated);
        });

        this.swipeController = swipeController;

        //return swipeController;
      }
    }
  }])

  .factory('$ionicSwipeCardDelegate', ['$rootScope', function($rootScope) {
    return {
      popCard: function($scope, isAnimated) {
        $rootScope.$emit('swipeCard.pop', isAnimated);
      },
      getSwipeableCard: function($scope) {
        return $scope.$parent.swipeCard;
      }
    }
  }]);

})(window.ionic);
