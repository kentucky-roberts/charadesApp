angular.module('app.filters', [])
/**/
.filter('exclude', function() {
  return function(input, exclude) {
    var result = [];
    for (var i=0; i<input.length; i++) {
      if (input[i] !== exclude) {
        result.push(input[i]);
      }
    }

    return result;
  };
})


.filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
})

.filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })