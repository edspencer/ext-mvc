/**
 * Ext.Desktop
 * @extends Ext.Container
 * Provides a Desktop with a DesktopLayout for managing shortcuts
 */
Ext.Desktop = function(config) {
  var config = config || {};
  
  this.desktopEl = Ext.get('x-desktop');
  
  Ext.applyIf(config, {
    renderTo:    'x-desktop',
    layout:      'desktop',
    stateful:    true,
    stateId:     'desktop-shortcuts',
    stateEvents: ['shortcutmoved', 'shortcutcreated', 'shortcutdeleted'],
    
    defaults: {
      xtype: 'desktop_shortcut'
    },
    
    /**
     * Finds current config for each shortcut
     * @return {Object} Object containing desktop icons
     */
    getState: function() {
      var shortcuts = [];
      var items = this.items.items;
      
      for (var i=0; i < items.length; i++) {
        var item = items[i];
        if (parseInt(item.position, 10) > 0) {
          shortcuts.push({
            text:     item.text,
            position: parseInt(item.position, 10),
            icon:     item.icon
          });
        }
      };
      
      return {
        items: shortcuts
      };
    },
    
    /**
     * Retrieves shortcuts from state provider and adds them to the desktop
     */
    applyState: function(state) {
      for (var i=0; i < state.items.length; i++) {
        if (state.items[i].position > 0) {
          this.add(state.items[i]);          
        };
      };      
    }
  });
  
  Ext.Desktop.superclass.constructor.call(this, config);
  
  this.addEvents({
    'beforeshortcutmoved':   true,
    'shortcutmoved':         true,
    'beforeshortcutcreated': true,
    'shortcutcreated':       true,
    'beforeshortcutdeleted': true,
    'shortcutdeleted':       true
  });
  
  //set up shortcuts drag and drop
  this.initializeDragZone();  
  this.initializeDropZone();
};

Ext.extend(Ext.Desktop, Ext.Container, {
  
  getLayoutTarget: function() {
    return this.desktopEl;
  },
  
  initializeDropZone: function() {
    var desktop = this;
    
    this.dropZone = new Ext.dd.DropTarget(this.desktopEl, {
            
      /**
       * Updates the drag element's class when drop is allowed
       */
      notifyOver: function(ddSource, e, data) {
        console.log(ddSource);
        console.log(data);
        if (this.canDropOnLocation(ddSource, e, data)) {
          return Ext.dd.DropZone.prototype.dropAllowed;
        } else {
          return Ext.dd.DropZone.prototype.dropNotAllowed;
        };
      },
      
      /**
       * Tell the DataView to associate the image
       */
      notifyDrop: function(ddSource, e, data) {
        if (this.canDropOnLocation(ddSource, e, data) && (target = e.getTarget('td.shortcut-position'))) {
          
          //try to find an existing shortcut
          var existing = desktop.items.filter('id', data.sourceEl.id).items[0];
          
          if (existing) {
            if (desktop.fireEvent('beforeshortcutmoved')) {
              existing.position = target.id.split("-").last();
              desktop.fireEvent('shortcutmoved');
            };
          } else {
            Ext.applyIf(data.shortcutConfig, { position: target.id.split("-").last() });
            
            if (desktop.fireEvent('beforeshortcutcreated', desktop)) {
              
              var newShortcut = new Ext.ux.Shortcut(data.shortcutConfig);
              desktop.items.add(newShortcut);
              
              desktop.fireEvent('shortcutcreated', desktop, newShortcut);
            };
          };
                  
          desktop.doLayout();
          return true;
        };
        
        return false;
      },
      
      /**
       * Returns true if a drop is allowed here
       */
      canDropOnLocation: function(ddSource, e, data) {
        //check that we're not currently hovering above a window
        if (e.getTarget('.x-window')) {
          return false;
        };
        
        //check that we're not currently hovering above another icon
        if (e.getTarget('.x-shortcut')) {
          return false;
        };
        
        //if we're hovering over a free shortcut location, all is well
        if (e.getTarget('td.shortcut-position') && this.hasValidShortcutConfig(data)) {
          return true;
        } else {
          return false;
        };
      },
      
      /**
       * Ensures that the dropped object has a valid shortcut config (has text, icon and launchConfig)
       * @param {Object} The dropped element's dragData
       * @return {Boolean} True if the dropped item has a valid shortcut config
       */
      hasValidShortcutConfig: function(data) {
        var conf = data.shortcutConfig;
        
        // if (!conf)              {return false};
        // if (!conf.text)         {return false};
        // if (!conf.icon)         {return false};
        // if (!conf.launchConfig) {return false};
        
        return true;
      }
    });
  },
  
  /**
   * Sets up each item in the DataView as a draggable element
   */
  initializeDragZone: function() {
    this.dragZone = new Ext.dd.DragZone(this.desktopEl, {
      
      getDragData: function(e) {
        var sourceEl = e.getTarget('div.x-shortcut', 10);
        
        if (sourceEl) {
          var draggable = sourceEl.cloneNode(true);
          
          draggable.id = Ext.id();
          
          return this.dragData = {
            sourceEl:  sourceEl,
            repairXY:  Ext.fly(sourceEl).getXY(),
            ddel:      draggable,
            shortcut:  this
          };
        };
      },
      
      getRepairXY: function() {
        return this.dragData.repairXY;
      }
    });
  }
});

Ext.reg('desktop', Ext.Desktop);