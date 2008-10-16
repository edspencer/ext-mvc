/**
 * Ext.ux.App.view.DefaultEditWindowWithTinyMce
 * @extends Ext.ux.App.view.DefaultEditWindow
 * Sets up hooks for Tiny Mce integration for all textareas with class 'mceEditor'
 */
Ext.ux.App.view.DefaultEditWindowWithTinyMce = function(config) {
  var config = config || {};
  
  Ext.ux.App.view.DefaultEditWindowWithTinyMce.superclass.constructor.call(this, config);
  
  //add the tiny MCE hooks
  this.on('formloaded',    this.initTinyMce);
  this.on('beforesave',    function() { tinyMCE.triggerSave(); });
  this.on('beforedestroy', this.removeTinyMceTextAreas);
};
Ext.extend(Ext.ux.App.view.DefaultEditWindowWithTinyMce, Ext.ux.App.view.DefaultEditWindow, Ext.ux.App.TinyMceMethods);

Ext.reg('default_edit_window_with_tiny_mce', Ext.ux.App.view.DefaultEditWindowWithTinyMce);