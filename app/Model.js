/**
 * Ext.ux.App.model
 * @extends Ext.util.Observable
 * Base model class
 */
Ext.ux.App.model = function(config) {
  var config = config || {};
  
  Ext.apply(this, config, {
    defaultType: 'string',
    includeId:   true
  });
  
  this.attributes = [];
  this.init();
  
  Ext.ux.App.model.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.App.model, Ext.util.Observable, {
  init: function() {
    this.createAttributes();
  },
  
  /**
   * iterates over this.fields, creates attributes for each
   */
  createAttributes: function() {
    
  },
  
  /**
   * Returns the requested attribute, or null if not found
   */
  getAttribute: function(name) {
    
  }
});