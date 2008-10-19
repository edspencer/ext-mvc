/**
 * Ext.ux.ChangeLog
 * @extends Ext.util.Observable
 * Manages all changes to an app.  Returns all changes after a given date
 */
Ext.ux.ChangeLog = function(config) {
  var config = config || {};
  
  this.items = {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.ChangeLog.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.ChangeLog, Ext.util.Observable, {
  sinceDate: function(date) {
    var date = date || new Date();
    
    return this.items.all
  },
  
  addItem: function(date, item) {
    this.items.push({date: item});
  }
});