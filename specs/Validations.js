describe('Presence Validation', {
  before_each : function() {
    model      = new Ext.ux.MVC.Spec.FakeUser();
    validation = new Ext.ux.App.model.PresenceValidation(model, 'name');
    
    customValidation = new Ext.ux.App.model.PresenceValidation(model, 'name', {
      message: 'seriously... must be present'
    });
  },
  
  'should return false if the field is empty': function() {
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return true if the field is not empty': function() {
    model.data.name = 'not blank';
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return the correct message when not valid': function() {
    validation.isValid();
    value_of(validation.message).should_be('must be present');
  },
  
  'should allow specification of a custom message': function() {
    customValidation.isValid();
    value_of(customValidation.message).should_be('seriously... must be present');
  }
});

describe('Length Validation', {
  before_each : function() {
    model      = new Ext.ux.MVC.Spec.FakeUser();
    validation = new Ext.ux.App.model.LengthValidation(model, 'name', {min: 5, max: 10});
  },
  
  'should return false if the field is too short': function() {
    model.data.name = 'Nick';
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return false if the field is too long': function() {
    model.data.name = 'Christopher';
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return true if the field is an acceptable length': function() {
    model.data.name = 'Edward';
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return the correct message when the value is too short': function() {
    validation.isValid();
    value_of(validation.message).should_be('is too short (minimum length is 5)');
  },
  
  'should return the correct message when the value is too long': function() {
    model.data.name = 'Edward Spencer';
    validation.isValid();
    value_of(validation.message).should_be('is too long (maximum length is 10)');
  }
});

describe('Numericality Validation', {
  before_each : function() {
    model      = new Ext.ux.MVC.Spec.FakeUser();
    validation = new Ext.ux.App.model.NumericalityValidation(model, 'id');
  },
  
  'should return false if the field is not a number': function() {
    model.data.id = 'not a number!';
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return true if the field is a number': function() {
    model.data.id = 100;
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return the correct message': function() {
    model.data.id = 'not a number!';
    validation.isValid();
    value_of(validation.message).should_be('must be a number');
  }
});

describe('Inclusion Validation', {
  before_each : function() {
    model          = new Ext.ux.MVC.Spec.FakeUser();
    validation     = new Ext.ux.App.model.InclusionValidation(model, 'name', ['Ed', 'Nick', 'John']);
    longValidation = new Ext.ux.App.model.InclusionValidation(model, 'name', ['Ed', 'Nick', 'John', 'Matt', 'Chris', 'Pete']);
  },
  
  'should return true if the value is within the acceptable values': function() {
    model.data.name = 'Nick';
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return false if the values is not one of the acceptable values': function() {
    model.data.name = 'Matt';
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return the correct message when there are few acceptable values': function() {
    validation.isValid();
    value_of(validation.message).should_be('must be one of Ed, Nick or John');
  },
  
  'should return the correct message when there are many acceptable values': function() {
    model.data.name = 'Edward Spencer';
    longValidation.isValid();
    value_of(longValidation.message).should_be('must be one of the acceptable values');
  }
});

describe('Exclusion Validation', {
  before_each : function() {
    model          = new Ext.ux.MVC.Spec.FakeUser({name: 'Nick'});
    validation     = new Ext.ux.App.model.ExclusionValidation(model, 'name', ['Ed', 'Nick', 'John']);
    longValidation = new Ext.ux.App.model.ExclusionValidation(model, 'name', ['Ed', 'Nick', 'John', 'Matt', 'Chris', 'Pete']);
  },
  
  'should return false if the value is within the acceptable values': function() {
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return true if the values is not one of the acceptable values': function() {
    model.data.name = 'Matt';
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return the correct message when there are few acceptable values': function() {
    validation.isValid();
    value_of(validation.message).should_be('must not be one of Ed, Nick or John');
  },
  
  'should return the correct message when there are many acceptable values': function() {
    model.data.name = 'Matt';
    longValidation.isValid();
    value_of(longValidation.message).should_be('must not be one of the unacceptable values');
  }
});

describe('Format Validation', {
  before_each : function() {
    model          = new Ext.ux.MVC.Spec.FakeUser({name: 'Nick'});
    validation     = new Ext.ux.App.model.FormatValidation(model, 'name', new RegExp(/Ed/));
  },
  
  'should return false if the value does not match the regular expression': function() {
    value_of(validation.isValid()).should_be(false);
  },
  
  'should return true if the value does match the regular expression': function() {
    model.data.name = 'Edward';
    value_of(validation.isValid()).should_be(true);
  },
  
  'should return the correct message': function() {
    validation.isValid();
    value_of(validation.message).should_be('is not in the correct format');
  }
});