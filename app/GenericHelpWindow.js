/**
 * Ext.ux.App.view.GenericHelpWindow
 * @extends Ext.Window
 * Generic window class with sensible defaults.  Subclass with custom behaviour
 * or instantiate directly with title and html config
 */
Ext.ux.App.view.GenericHelpWindow = function(config) {
  var config = config || {};
  
  this.keyboardShortcuts = 
  
  Ext.applyIf(config, {
    width:       500,
    height:      400,
    iconCls:     'help',
    cls:         'x-window-help',
    shim:        false,
    collapsible: true,
    bodyStyle:   'padding: 10px',
    autoScroll:  true
  });
  
  Ext.ux.App.view.GenericHelpWindow.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.view.GenericHelpWindow, Ext.Window);
Ext.reg('user_manager_help', Ext.ux.App.view.GenericHelpWindow);

/**
 * Returns an array of DomSpec tags which enumerate the normal CRUD keyboard shortcuts.
 * @param {Ext.ux.model.Base} model The model this help screen refers to
 * @returns {Array} The array of formatted HTML elements which can be appended to the html config in any panel
 */
Ext.ux.App.view.GenericHelpWindow.keyboardShortcuts = function(model) {
  var singular = model.human_singular_name;
  var plural   = model.human_plural_name;
  
  return [
    {tag: 'h1', html: 'Keyboard shortcuts'},
    {tag: 'p',  html: 'For your convenience, several keyboard shortcuts have been added to this application:'},
    {tag: 'dl', cls: 'shortcuts', 
      children: [
        {tag: 'dt', html: 'f:'}, {tag: 'dd', html: 'Navigate to the first page of ' + plural},
        {tag: 'dt', html: 'p:'}, {tag: 'dd', html: 'Navigate to the previous page of ' + plural},
        {tag: 'dt', html: 'n:'}, {tag: 'dd', html: 'Navigate to the next page of ' + plural},
        {tag: 'dt', html: 'l:'}, {tag: 'dd', html: 'Navigate to the last page of ' + plural},
        {tag: 'dt', html: 'r:'}, {tag: 'dd', html: 'Refresh the current view'},
        {tag: 'dt', html: 'a:'}, {tag: 'dd', html: 'Open the Add ' + singular + ' window'},
        {tag: 'dt', html: 'e:'}, {tag: 'dd', html: 'Edit all currently selected ' + plural},
        {tag: 'dt', html: 'd:'}, {tag: 'dd', html: 'Delete all currently selected ' + plural}
      ]
    },
    {tag: 'p', html: 'Most buttons in each application have keyboard shortcuts.  Try hovering over a button briefly with the mouse - if it has a shortcut button a tooltip will appear telling you what it is'}
  ];
};