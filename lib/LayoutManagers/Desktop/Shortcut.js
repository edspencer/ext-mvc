/**
 * Ext.ux.Shortcut
 * @extends Ext.Component
 * Desktop shortcut implementation
 */
Ext.ux.Shortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    text:              'Some Desktop Shortcut',
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
  
  this.config = config;
  
  Ext.ux.Shortcut.superclass.constructor.call(this, config);
  
  this.id = "shortcut-" + config.position;
};

Ext.extend(Ext.ux.Shortcut, Ext.Component, {
  hoverClass:    'x-shortcut-hover',
  selectedClass: 'x-shortcut-selected',
  
  template: new Ext.Template(
    '<div class="x-shortcut" id="{2}">',
      '<div class="x-shortcut-icon"><img src="{1}" /></div>',
      '<span>{0}</span>',
    '</div>'
  ),
    
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
  },
  
  /**
   * Marks this shortcut as selected (unselects all other shortcuts)
   */
  select: function() {
    Ext.ux.Shortcut.unselectAllShortcuts();
    this.el.addClass(this.selectedClass);
  },
  
  /**
   * Unselects this shortcut
   */
  unselect: function() {
    this.el.removeClass(this.selectedClass);
  }
});

/**
 * Removes this.selectedClass from all shortcuts
 */
Ext.ux.Shortcut.unselectAllShortcuts = function() {
  var shortcuts = Ext.ComponentMgr.all.filter('xtype', 'desktop_shortcut');
  shortcuts.each(function(e) {e.unselect();});
};

Ext.reg('desktop_shortcut', Ext.ux.Shortcut);