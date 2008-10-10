/**
 * Ext.ux.DesktopLayout
 * @extends Ext.layout.ContainerLayout
 * Provides a grid layout suitable for a desktop, with drag/drop and programmatic placement and rearrangement
 */
Ext.ux.DesktopLayout = function(config) {
  var config = config || {};
  
  //these are applied to 'this' by the superclass
  Ext.applyIf(config, {
    shortcutSize: 90,
    items:        [],
    positions:    [],
    shortcuts:    []
  });
  
  Ext.ux.DesktopLayout.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.DesktopLayout, Ext.layout.ContainerLayout, {
  
  monitorResize: true,
  
  /**
   * Ensures we have a reference to the desktop, builds and populates layout table with this.items
   */
  onLayout: function(container, target) {
    if (!this.desktop) {
      this.desktop = container.desktop;
    };
    
    if (!this.table) {
      this.createLayoutTable(target);
    };
    
    this.renderAll(container, target);
  },
  
  onResize: function() {
    console.log("resized");
  },
  
  /**
   * Builds the table used internally to lay the icons out on the Desktop.
   * @params {Ext.Element} target The target element to create the table in
   */
  createLayoutTable: function(target) {
    //add a table and tbody
    this.table = target.createChild({tag: 'table', cls: 'x-desktop-table', cellspacing: 0});      
    this.tbody = this.table.createChild({tag: 'tbody'});
    
    var shortcutsWide = this.shortcutsWide();
    var shortcutsHigh = this.shortcutsHigh();
    
    //create each position element (<td>).  Keep a reference to each in this.positions
    for (var i=1; i < shortcutsHigh + 1; i++) {
      var currentTr = this.tbody.createChild({tag: 'tr'});
      for (var j=1; j < shortcutsWide + 1; j++) {
        
        this.positions.push(currentTr.createChild({
          tag:    'td', 
          id:     'shortcut-position-' + (i + (shortcutsHigh * (j-1))), 
          cls:    'shortcut-position',
          // style:  'border: 1px solid red;',
          height: this.shortcutSize,
          width:  this.shortcutSize
        }));  
      };
    };
  },
  
  renderAll : function(ct, target){
    var items = ct.items.items;
    for(var i = 0, len = items.length; i < len; i++) {
      var c = items[i];
      if(c && (!c.rendered || !this.isValidParent(c, target))){
        this.renderItem(c, c.position, target);
      }
    }
  },

  /**
   * Renders the item into the correct position on the desktop
   * @param {Component} c The component to render (this should not have been rendered previously)
   * @param {Number} position The position on the desktop to render this item to
   */
  renderItem: function(c, position) {
    if(c){
      if (c.rendered) {
        //ensure it is in the correct position
        this.findLocationById(position).insertFirst(c.id);;
      } else {
        c.render(this.findLocationById(position));
      };
    }
  },
  
  /**
   * Returns the underlying table TD element for the specified position
   * @param {Number} id The numerical ID of the position
   * @return {Ext.Element} The TD Element (if found)
   */
  findLocationById: function(id) {
    return this.positions.detect(function(e) {return e.id == 'shortcut-position-' + id;});
  },

  /**
   * Returns the maximum number of shortcuts that can appear vertically stacked given
   * the desktop's current height and the size of this.shortcutSize
   */
  shortcutsHigh: function() {
    return parseInt(this.desktop.getWinHeight() / this.shortcutSize);
  },
 
  /**
   * Returns the maximum number of shortcuts that can appear horizontally stacked given
   * the desktop's current width and size of this.shortcutSize
   */
  shortcutsWide: function() {
    return parseInt(this.desktop.getWinWidth() / this.shortcutSize);   
  },
  
  /**
   * Adds the shortcut config to the specified position or the first available position
   */
  addShortcut: function(config) {
    console.log("adding shortcuts");
    console.log(config);
    Ext.applyIf(config, {
      position: this.firstAvailablePosition()
    });
       
    //make sure we can add the shortcut to this position:   
    if (!this.shortcutPositionAvailable(config.position)) {
      config.position = this.firstAvailablePosition();
    };
   
    var shortcut = config;
   
    this.shortcuts.push(shortcut);
  },
  
  /**
   * Adds an array of shortcuts to the desktop
   * @param {Array} An array of shortcut config objects
   */
  addShortcuts: function(array) {
    for (var i = array.length - 1; i >= 0; i--){
      this.addShortcut(array[i]);
    };
  },
  
  removeShortcut: function(id) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: remove shortcut code here
  },
 
  updateShortcut: function(id, config) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: update shortcut code here
  },
  
  /**
   * Returns the first available position for an icon to appear
   * @param {Integer} startIndex an optional index to start the search from
   * @return {Integer} The first available position at which to place a shortcut
   */
  firstAvailablePosition: function(startIndex) {
    var startIndex  = startIndex || 0;
    var maxPosition = this.highestShortcutPosition();
   
    //try to find the first available untaken position
    for (var i = startIndex; i < maxPosition; i++) {
      if (this.shortcutPositionAvailable(i)) {
        return i;
      };
    };
   
    //default to the highest existing position plus one
    return maxPosition + 1;
  },
 
  /**
   * Returns true if the indicated position is already occupied by a shortcut
   * @param {Integer} position The position to check
   * @return {Boolean} True if the position has already been taken
   */
  shortcutPositionAvailable: function(position) {
    var shortcuts = this.shortcuts;
   
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].position == position) {
        return false;
      };
    };
   
    return true;
  },
 
  /**
   * Returns the highest position currently occupied by a shortcut
   */
  highestShortcutPosition: function() {
    var shortcuts = this.shortcuts;
   
    var maxPosition = 0;
    for (var i = shortcuts.length - 1; i >= 0; i--){
      var pos = shortcuts[i].position;
     
      if (pos > maxPosition) { maxPosition = pos; }
    };
   
    return maxPosition;
  },
 
  /**
   * Attempts to find the shortcut with the given ID
   * @param {String} id The id of the shortcut to find
   * @return {Mixed} The shortcut object or false if it could not be found
   */
  findShortcutById: function(id) {
    var shortcuts = this.shortcuts;
    
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].id == id) {
        return shortcuts[i];
      };
    };
   
    return false;
  },
 
  /**
   * Allows searching of shortcuts by a given function
   * @param {Function} fn The function to find the shortcut by.  The function should return true for a match
   * @param {Scope} scope An optional scope to execute the finder function in
   * @return {Array} An array of matching shortcuts
   */
  findShortcutsBy: function(fn, scope) {
    var scope = scope || this;
    
    var shortcuts = this.shortcuts;
   
    var matches = [];
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (fn.call(scope, shortcuts[i]) === true) {
        matches.push(shortcuts[i]);
      };
    };
   
    return matches;
  }
});

Ext.reg('desktop_layout', Ext.ux.DesktopLayout);
Ext.Container.LAYOUTS['desktop'] = Ext.ux.DesktopLayout;