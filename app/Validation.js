/**
 * Validation base class - subclass this with your own implementations
 * @param {Ext.data.Record} record The Ext.data.Record or Record subclass to attach this validation to
 */
Ext.ux.App.model.Validation = function(record, fieldName, config) {
  var config = config || {};
  
  this.record    = record;
  this.fieldName = fieldName;  

  //provide default implementations
  Ext.applyIf(config, {
    isValid: function() {
      return true;
    },
    
    /**
     * Gets the current value of this field
     */
    getValue: function() {
      return this.record.data[this.fieldName];
    }
  });
  
  Ext.apply(this, config, {
    /**
     * Override this.init to perform any setup required
     */
    init: Ext.emptyFn
  });
  
  this.init();
};

/**
 * Ext.ux.App.model.PresenceValidation
 * @extends Ext.ux.App.model.Validation
 * Validates the presence of a field
 */
Ext.ux.App.model.PresenceValidation = function(record, fieldName, config) {
  var config = config || {};
    
  Ext.applyIf(config, {
    message: 'must be present',
    
    isValid: function() {
      var value = this.getValue();
      if (typeof(value) == 'undefined') {
        return false;
      } else {
        return (value.length >= 0);
      }
    }
  });
  
  Ext.ux.App.model.PresenceValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.PresenceValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.LengthValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the length of a field is within acceptable boundaries
 */
Ext.ux.App.model.LengthValidation = function(record, fieldName, config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    message: 'is not an acceptable length',
    
    /**
     * Returns false if this field is not within the min and max values of the config object
     */
    isValid: function() {
      //assume an unset value is the same as an empty string
      var value = this.getValue() || '';
      
      if (config.min && value.length < config.min) {
        this.message = 'is too short (minimum length is 5)';
        return false;
      };
      
      if (config.max && value.length > config.max) {
        this.message = 'is too long (maximum length is 10)';
        return false;
      };
      
      return true;
    }
  });
  
  Ext.ux.App.model.LengthValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.LengthValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.NumericalityValidation
 * @extends Ext.ux.App.model.Validation
 * Validates the numericality of a field
 */
Ext.ux.App.model.NumericalityValidation = function(record, fieldName, config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    message: 'must be a number',

    /**
     * Returns true if field is a number
     */
    isValid: function() {
      return (typeof(this.getValue()) == 'number');
    }
  });
  
  Ext.ux.App.model.NumericalityValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.NumericalityValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.InclusionValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the field exactly matches at least one element of an array
 */
Ext.ux.App.model.InclusionValidation = function(record, fieldName, includeValues, config) {
  var config = config || {};
  
  if (!includeValues) {throw new Error("You must provide an array of values to an Inclusion Validation");}
  
  this.includeValues = includeValues;
    
  Ext.applyIf(config, {
    message: 'must be one of ',
    
    /**
     * Returns true if the current value exactly matches at least one element of the values array
     */
    isValid: function() {
      var value = this.getValue();
      
      return this.includeValues.any(function(e) {return e == value;});
    },
    
    /**
     * Sets this.message to a more meaningful message based on the acceptable values
     */
    setMessage: function() {
      if (this.includeValues.length < 5) {
        this.message += this.includeValues.toSentence('or');
      } else {
        this.message += 'the acceptable values';
      };
    },
    
    init: function() {
      this.setMessage();
    }
  });
  
  Ext.ux.App.model.InclusionValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.InclusionValidation, Ext.ux.App.model.Validation);


/**
 * Ext.ux.App.model.ExclusionValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the field does not match any of the supplied elements
 */
Ext.ux.App.model.ExclusionValidation = function(record, fieldName, excludeValues, config) {
  var config = config || {};
  
  if (!excludeValues) {throw new Error("You must provide an array of values to an Exclusion Validation");}
  
  this.excludeValues = excludeValues;
    
  Ext.applyIf(config, {
    message: 'must not be one of ',
    
    /**
     * Returns false if the current value exactly matches at least one element of the values array
     */
    isValid: function() {
      var value = this.getValue();
      
      return !this.excludeValues.any(function(e) {return e == value;});
    },
    
    /**
     * Sets this.message to a more meaningful message based on the unacceptable values
     */
    setMessage: function() {
      if (this.excludeValues.length < 5) {
        this.message += this.excludeValues.toSentence('or');
      } else {
        this.message += 'the unacceptable values';
      };
    },
    
    init: function() {
      this.setMessage();
    }
  });
  
  Ext.ux.App.model.ExclusionValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.ExclusionValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.FormatValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the value of a field matches the passed regular expression
 */
Ext.ux.App.model.FormatValidation = function(record, fieldName, regExp, config) {
  var config = config || {};
  
  if (!regExp) {throw new Error("You must pass a regular expression object or string to a Format Validation");}
  this.regExp = regExp;
  
  Ext.applyIf(config, {
    message: 'is not in the correct format',

    /**
     * Returns true if field is a number
     */
    isValid: function() {
      return this.regExp.test(this.getValue());
    },
    
    /**
     * Ensures that we have a RegExp object in this.regExp
     */
    init: function() {
      if (typeof(this.regExp) == 'string') {
        this.regExp = new RegExp(this.regExp);
      };
      
      if (!this.validRegExp(this.regExp)) {
        throw new Error("Invalid RegExp in Format Validation");
      };
      
      this.setMessage();
    },
    
    /**
     * Override this method to update this.message
     */
    setMessage: Ext.emptyFn,
    
    /**
     * Attempt to find out whether the supplied object is a RegExp
     * @param {object} regExp The object to test
     * @returns {Boolean} True if this object appears to be a RegExp
     */
    validRegExp: function(regExp) {
      return typeof(regExp.test) == 'function';
    }
  });
  
  Ext.ux.App.model.FormatValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.FormatValidation, Ext.ux.App.model.Validation);