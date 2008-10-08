describe('Array methods', {
  before_each: function() {
    numerical_array = [1,5,6,9];
    string_array    = ['str', 'eek', 'rar'];
    
    matcher1 = function(element) {
      return (element == 5 ? true : false);
    };
    
    matcher2 = function(element) {
      return false;
    };
    
    matcher3 = function(element) {
      return true;
    };
    
    //matches (selects) any element containing the letter r
    matcherA = function(element) {
      if (/r/.test(element)) {return true;}
    };
    
    //matches (rejects) any element containing the letter e
    matcherB = function(element) {
      if (/e/.test(element)) {return true;}
    };
  },
  
  'sum the values of an array': function() {
    value_of(numerical_array.sum()).should_be(21);
  },
  
  'should pick the maximum value from an array': function() {
    value_of(numerical_array.max()).should_be(9);
  },
  'should pick the mimimum value from an array': function() {
    value_of(numerical_array.min()).should_be(1);
  },
  
  'should return true if any elements of an array match the supplied function for Array.any': function() {
    value_of(numerical_array.any(matcher1)).should_be(true);
  },
  'should return false if none of the elements of an array match the supplied function for Array.any': function() {
    value_of(numerical_array.any(matcher2)).should_be(false);
  },
  
  'should detect the first matching element for a given function': function() {
    //matcher1 matches all elements, so we should expect the first one here
    value_of(numerical_array.detect(matcher3)).should_be(1);
  },
  
  'should detect the first matching element for a given value': function() {
    value_of(numerical_array.detect(5)).should_be(5);
  },
  
  'should return nil if detect did not match any elements': function() {
    value_of(numerical_array.detect(matcher2)).should_be(null);
  },
  
  'should return true if all elements of an array match the supplied function for Array.all': function() {
    value_of(numerical_array.all(matcher3)).should_be(true);
  },
  'should return false if at least one of the elements of an array does not match the supplied function for Array.all': function() {
    value_of(numerical_array.all(matcher1)).should_be(false);
  },
  
  'should select all array elements matching a function': function() {
    var matches = string_array.select(matcherA);
    value_of(matches.length).should_be(2);
  },
  
  'should reject all array elements matching a function': function() {
    var matches = string_array.reject(matcherB);
    value_of(matches.length).should_be(2);
  },
  
  'should collect the array into a new array': function() {
    //simple function to add 1 to each element of the array
    var collected = numerical_array.collect(function(e) {return e + 1;});
    
    value_of(collected).should_be([2,6,7,10]);
  }
});