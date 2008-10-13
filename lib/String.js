Ext.override(String, {

  /**
   * @param {String} str A string to be capitalized
   * @returns A capitalized string (e.g. "some test sentence" becomes "Some test sentence")
   * @type String
   */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
  },

  /**
   * @param {String} str A string to be turned into title case
   * @returns The string in Title Case (e.g. "some test sentence" becomes "Some Test Sentence")
   * @type String
   */
  titleize: function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  },

  /**
   * Takes any string and de-underscores and uppercases it
   * e.g. long_underscored_string => LongUnderscoredString
   */
  camelize: function() {
    return this.replace(/_/g, " ").titleize().replace(/ /g, "");

    // this feels nicer, sadly no collect function (yet) though
    // class_name_string.split("_").collect(function(e) {return String.capitalize(e)}).join("");
  },
  
  /**
   * 
   */
  classify: function() {
    
  },
  
  /**
   * Returns a truncated version of this string
   * @param {Number} maxLength The maximum length a string can be before it is truncated
   * @param {String} trailingString The string to append if the string is too long.  Defaults to '...'.  When truncating, the length of the trailing string will be taken into account to ensure the returned string is the right length
   */
  truncate: function(maxLength, trailingString) {
    var trailingString = trailingString || '...';
    var maxLength = parseInt(maxLength) - trailingString.length;
    
    if (this.length > maxLength) {
      return this.substring(0, maxLength) + trailingString;
    } else {
      return this;
    };
  }
});