/**
 * Ext.ux.App.view.DefaultNewWindowWithTinyMce
 * @extends Ext.ux.App.view.DefaultNewWindow
 * Sets up Tiny MCE hooks for all textareas with class 'mceEditor'
 */
Ext.ux.App.view.DefaultNewWindowWithTinyMce = function(config) {
  var config = config || {};
  
  Ext.ux.App.view.DefaultNewWindowWithTinyMce.superclass.constructor.call(this, config);
  
  //add the tiny MCE hooks
  this.on('show',          this.initTinyMce);
  this.on('beforesave',    function() { tinyMCE.triggerSave(); });
  this.on('beforedestroy', this.removeTinyMceTextAreas);
};
Ext.extend(Ext.ux.App.view.DefaultNewWindowWithTinyMce, Ext.ux.App.view.DefaultNewWindow, Ext.ux.App.TinyMceMethods);

Ext.reg('default_new_window_with_tiny_mce', Ext.ux.App.view.DefaultNewWindowWithTinyMce);