/**
 * Ext.ux.MVC.LayoutManager.DesktopLayoutManager
 * @extends Ext.ux.MVC.LayoutManager.Base
 * Creates a complete online desktop with start button and task bar
 */
Ext.ux.MVC.LayoutManager.DesktopLayoutManager = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.MVC.LayoutManager.DesktopLayoutManager.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.LayoutManager.DesktopLayoutManager, Ext.ux.MVC.LayoutManager.Base);
Ext.reg('desktop_layout_manager', Ext.ux.MVC.LayoutManager.DesktopLayoutManager);