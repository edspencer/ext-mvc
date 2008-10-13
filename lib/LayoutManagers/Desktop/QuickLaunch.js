/**
 * Ext.ux.QuickLaunch
 * @extends Ext.Component
 * A Quick Launch area intended to be attached to a Start bar or other menu
 */
Ext.ux.QuickLaunch = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    renderTo: 'ux-taskbar-quick-launch',
    el: 'ux-taskbar-quick-launch',
    id:       'QuickLaunch',
    
    stateful: true,
    stateId:  'quick_launch',
    
    applyState: function() {
      console.log("quick launch apply state");
    },
    
    getState: function() {
      console.log("quick launch get state");
    }
  });
  
  Ext.ux.QuickLaunch.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.QuickLaunch, Ext.Component, {
  render: function() {
    console.log("rendering quick launch");
    
    
    Ext.ux.QuickLaunch.superclass.render.apply(this, arguments)
    console.log("frak");
  },
  
  onRender: function() {
    console.log("on render");
    this.el = new Ext.Element('<p></p>');
  }
});
Ext.reg('quick_launch', Ext.ux.QuickLaunch);