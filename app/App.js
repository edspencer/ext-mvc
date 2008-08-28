/**
 * Ext.ux.App.Base
 * @extends Ext.app.Module
 * Description
 */
Ext.ux.App.Base = function(config) {
  var config = config || {};
  
  this.launch = function(launch_config) {
    this.desktop = this.app.getDesktop();
    this.controller.callAction('index');
  };
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.App.Base.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.Base, Ext.app.Module);