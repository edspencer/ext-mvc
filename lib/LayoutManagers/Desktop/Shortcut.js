/**
 * Ext.ux.Shortcut
 * @extends Ext.Component
 * Generic shortcut implementation
 * You would usually not use this directly, instead use DesktopShortcut, QuickLaunchShortcut and StartMenuShortcut or define your own specialised subclass.  Remember to provide your own template when subclassing otherwise you will end up with empty divs instead of anything useful.  Check out DesktopShortcut for a simple example of this.
 * 
 */
Ext.ux.Shortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    text: 'Some Desktop Shortcut',
    id:    "shortcut-" + config.position
  });
  
  this.config = config;
  this.id = config.id;
  
  Ext.ux.Shortcut.superclass.constructor.call(this, config);  
};

Ext.extend(Ext.ux.Shortcut, Ext.Component, {
  hoverClass:    'x-shortcut-hover',
  selectedClass: 'x-shortcut-selected',
  
  /**
   * @config {Ext.Template} template The template to use when rendering this component's HTML.  The defaults to an empty div so you will need to override it
   */
  template: new Ext.Template('<div></div>'),
    
  /**
   * Renders the shortcut using its template, sets up various listeners
   */
  onRender: function(container) {
    this.el = this.template.append(container, [this.config.text, this.config.icon, this.id], true);
    this.el.on('mousedown',   this.onMouseDown,   this);
    this.el.on('dblclick',    this.onDblClick,    this);
    this.el.on('contextmenu', this.onContextMenu, this);
    this.el.on('mouseover',   this.onHover,       this);
    this.el.on('mouseout',    this.onHoverOut,    this);
  },
  
  onDblClick: function() {
    Ext.ux.MVC.NotificationManager.inform('Desktop item double clicked');
  },
  
  onHover: function() {
    this.el.addClass(this.hoverClass);
  },
  
  onHoverOut: function() {
    this.el.removeClass(this.hoverClass);
  },
  
  /**
   * Marks the shortcut as selected if the mousedown event is from a left click
   */
  onMouseDown: function(e) {
    if (e.button == 0) {
      this.select();
    };
  },
  
  /**
   * Marks this shortcut as selected (unselects all other shortcuts)
   */
  select: function() {
    Ext.ux.Shortcut.unselectAllShortcuts();
    this.el.addClass(this.selectedClass);
  },
  
  /**
   * Called on contextmenu event.  Override with your own logic
   * @param {Ext.EventObject} e The event object
   */
  onContextMenu: Ext.emptyFn,
  
  /**
   * Unselects this shortcut
   */
  unselect: function() {
    this.el.removeClass(this.selectedClass);
  }
});

/**
 * Removes this.selectedClass from all shortcuts
 * @param {String} xtype The xtype to find and unselect instances of.  Defaults to 'shortcut', change to one of the other shortcut xtypes (e.g. 'desktop_shortcut') to target just that type
 */
Ext.ux.Shortcut.unselectAllShortcuts = function(xtype) {
  var xtype = xtype || 'shortcut';
  var xtypeRegExp = new RegExp(xtype);
  
  var shortcuts = Ext.ComponentMgr.all.filterBy(function(e) {return xtypeRegExp.test(e.getXTypes()); })
  shortcuts.each(function(e) {e.unselect();});
};

Ext.reg('shortcut', Ext.ux.Shortcut);



/**
 * Ext.ux.DesktopShortcut
 * @extends Ext.ux.Shortcut
 * Provides a desktop icon component with right click menu
 */
Ext.ux.DesktopShortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    contextMenuConfig: {
      items: [
        {
          text:    'Delete this shortcut',
          scope:   this,
          iconCls: 'delete',
          handler: function() {
            Ext.ux.MVC.NotificationManager.inform('Deleting shortcut ' + this.id);
          }
        }
      ]
    }
  });
  
  Ext.ux.DesktopShortcut.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.DesktopShortcut, Ext.ux.Shortcut, {
  template: new Ext.Template(
    '<div class="x-shortcut x-shortcut-desktop" id="{2}">',
      '<div class="x-shortcut-icon"><img src="{1}" /></div>',
      '<span unselectable="on">{0}</span>',
    '</div>'
  ),
  
  /**
   * Intercepts right click and displays a context menu.  Override to provide your own implementation
   */
  onContextMenu: function(e) {
    e.stopEvent();
    this.select();
    
    if (!this.contextMenu) {
      this.contextMenu = new Ext.menu.Menu(this.config.contextMenuConfig);
    };
    
    //make sure the context menu has been rendered...
    if (!this.contextMenu.el) { this.contextMenu.render();}
    
    this.contextMenu.showAt(e.getXY());
  }
});
Ext.reg('desktop_shortcut', Ext.ux.DesktopShortcut);


/**
 * Ext.ux.QuickLaunchShortcut
 * @extends Ext.ux.Shortcut
 * Small shortcut icon intended to be added to a start bar quick launch area
 */
Ext.ux.QuickLaunchShortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.QuickLaunchShortcut.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.QuickLaunchShortcut, Ext.ux.Shortcut, {
  template: new Ext.Template(
    '<div class="x-shortcut x-shortcut-quick-launch" id="{2}">',
      '<div class="x-shortcut-icon"><img src="{1}" /></div>',
    '</div>'
  ),
  
  onContextMenu: function() {
    console.log("context menu appears");
  }
});
Ext.reg('quick_launch_shortcut', Ext.ux.QuickLaunchShortcut);