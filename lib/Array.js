/**
 * Custom Array extensions inspired by Ruby's Enumerable methods
 * @author Ed Spencer
 */
 
Ext.override(Array, {
  
  /**
   * Returns the first element of the array
   */
  first: function() {
    return this[0];
  },
  
  /**
   * Returns the last element of the array
   */
  last: function() {
    return this[this.length - 1];
  },
  
  /**
   * Runs the given function on each element of the array
   */
  each: function(fun, scope) {
    var scope = scope || this;
    for (var i=0; i < this.length; i++) {
      fun.call(scope, this[i]);
    };
  },
  
  /**
   * Returns true if the supplied function returns true for every element
   * @param {Function} function A function which is passed each element in turn.  If this function returns false at any point, Array.all returns false immediately, otherwise true is returned
   * @return {Boolean} True if the supplied function returns true for every element, false otherwise
   */
  all: function(fun) {
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) !== true) {
        return false;
      };
    };
    
    return true;
  },
  
  /**
   * Returns true if the supplied function returns true for any element
   * @param {Function} function A function which is passed each element in turn.  If this function returns true at any point, Array.any returns true immediately
   * @return {Boolean} True if the supplied function returns true for at least one element, false otherwise
   */
  any: function(fun) {
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) === true) {
        return true;
      };
    };
    
    return false;
  },
  
  /**
   * Returns the first matching element for which the supplied function returns true
   * @param {Function} functionOrValue A function which is passed each element in turn, or a value which is compared to each element.
   * @return {Mixed} The first element for which the supplied function returns true, null otherwise
   */
  detect: function(functionOrValue) {
    for (var i=0; i < this.length; i++) {
      if (typeof(functionOrValue) == 'function') {
        if (functionOrValue.call(this, this[i]) === true) {
          return this[i];
        };
      } else {
        if (functionOrValue == this[i]) {
          return this[i];
        };
      };
    };
    
    return null;
  },
  
  /**
   * Returns a new Array of all elements for which the supplied function returns true
   */
  select: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) === true) {
        newArray.push(this[i]);
      };
    };
    
    return newArray;
  },
  
  /**
   * Returns a new Array of all elements for which the supplied function did not return true
   */
  reject: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) !== true) {
        newArray.push(this[i]);
      };
    };
    
    return newArray;
  },
  
  /**
   * Iterates the given function over all elements of the array, returning a new array containing the result of the function as applied to each element
   */
  collect: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      newArray.push(fun.call(this, this[i]));
    };
    
    return newArray;
  },
  
  /**
   * Returns the largest number in this array
   */
  max: function() {
    return Math.max.apply({}, this);
  },
  
  /**
   * Returns the smallest number in this array
   */
  min: function() {
    return Math.min.apply({}, this);
  },
  
  /**
   * Sums all of the numbers in this array
   */
  sum: function() {
    for(var i=0,sum=0; i<this.length; sum += this[i++]);
    return sum;
  },
  
  /**
   * Turns an array of elements into a comma-delimited sentence, connected with the specified connector
   * Usage:
   * ['Ed', 'Nick', 'John'].toSentence(); // => 'Ed, Nick and John'
   * ['Ed', 'Nick', 'John'].toSentence('or'); // => 'Ed, Nick or John'
   * ['Ed', 'Nick', 'John'].toSentence('or', true); // => 'Ed, Nick, or John'
   * @param {String} connector The string to join the final two elements together with (defaults to 'and')
   * @param {Boolean} addFinalComma True to add a final comma between the final two elements (not good English! Don't do it!)
   */
  toSentence: function(connector, addFinalComma) {
    var connector = connector || 'and';
    var addFinalComma = addFinalComma || false;
    
    //build a temporary array so that we do not affect the contents of this array
    var firstValues = [];
    for (var i=0; i < this.length - 1; i++) { firstValues.push(this[i]); };
    var lastValue = this.last();
    
    var sentence = firstValues.join(", ");
    if (addFinalComma) { sentence += ',';}
    
    return sentence + ' ' + connector + ' ' + lastValue;
  }
});