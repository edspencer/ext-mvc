/**
 * Ext.Desktop
 * @extends Ext.Container
 * Provides a Desktop with a DesktopLayout for managing shortcuts
 */
Ext.Desktop = function(config) {
  var config = config || {};
  
  this.desktopEl = Ext.get('x-desktop');
  
  Ext.applyIf(config, {
    renderTo: 'x-desktop',
    layout:   'desktop',
    stateful: true,
    stateId:  'desktop-shortcuts',
    stateEvents: ['shortcutmoved', 'shortcutcreated'],
    
    items:    [
      {
        xtype:    'desktop_shortcut',
        position: 1,
        icon:     '/images/icons/48x48/application.png',
        text:     'Product Manager'
      },
      {
        xtype:    'desktop_shortcut',
        position: 2,
        icon:     '/images/icons/48x48/accept.png',
        text:     'View Image'
      },
      {
        xtype:   'desktop_shortcut',
        position: 25,
        icon:     '/images/icons/48x48/archive.png',
        text:     'Some other app'
      }
    ],
    
    getState: function() {
      console.log("get state");
      
      return {
        items: []
      };
    },
    
    applyState: function(state) {
      console.log("apply state");
    }
  });
  
  Ext.Desktop.superclass.constructor.call(this, config);
  
  this.addEvents({
    'shortcutmoved':   true,
    'shortcutcreated': true,
    'shortcutdeleted': true
  });
  
  //set up shortcuts drag and drop
  this.initializeDragZone();  
  this.initializeDropZone();
  
  this.on('beforestatesave',    this.saveShortcutState,    this);
  this.on('beforestaterestore', this.restoreShortcutState, this);
  
  this.on('statesave', function() {
    console.log("state saved");
  }, this);
  
  boo = this;
};

Ext.extend(Ext.Desktop, Ext.Container, {
  
  saveShortcutState: function(desktop, state) {
    var state = state || {};
    boo2 = state;
    console.log("save shortcut state");
    
    Ext.apply(state, {
      items: [
        {
          xtype: 'shortcut',
          text:  'test',
          position: 5
        }
      ]
    });
    
    console.log(state);
    
    return state;
  },
  
  restoreShortcutState: function(desktop, state) {
    console.log("restore shortcut state");
  },
  
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
            desktop.fireEvent('shortcutmoved');
            existing.position = target.id.split("-").last();
          } else {
            desktop.fireEvent('shortcutcreated');
            console.log("new shortcut");
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
        if (e.getTarget('td.shortcut-position')) {
          return true;
        } else {
          return false;
        };
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