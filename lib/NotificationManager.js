/**
 * Ext.ux.MVC.NotificationManager
 * Manages notification window positioning and expiration
 * @author Ed Spencer (edward@domine.co.uk)
 */

Ext.ux.MVC.NotificationManager = {
  windows: [],
  alignTo: 'br',
  offsets: {
    'br': [-15, -40],
    'bl': [15,  -40],
    'tl': [15, 15],
    'tr': [-15, 15]
  },
  
  /**
   * Updates the current alignment of the notification windows.
   * @param {String} newAlignment The new alignment of the windows.  Accepted values are tl, tr, bl and br (Top Left, Top Right, Bottom Left and Bottom Right respectively)
   */
  setAlignTo: function(newAlignment) {
    var allowedAlignments = ['tl', 'tr', 'bl', 'br'];
    if (allowedAlignments.detect(newAlignment)) {
      this.alignTo = newAlignment;
    };
  },
  
  notify: function(config) {
    //create Notification window, set up references and callbacks
    var win = new Ext.ux.MVC.Notification(config);
    win.on('beforeexpire', function(w) {return this.removeWindow(w);}, this);
    
    //align and display the window
    this.showWindow(win);
    win.el.alignTo(document, this.alignTo + '-' + this.alignTo, this.offsets[this.alignTo]);
    
    this.windows.push({
      position:  1,
      alignedTo: this.alignTo,
      win:       win,
      id:        win.id
    });
    
    return win;
  },
  
  inform: function(config) {
    var config = config || {};
    Ext.applyIf(config, {
      iconCls: 'notification-information'
    });
    
    return this.notify(config);
  },
  
  warn: function(config) {
    var config = config || {};
    Ext.applyIf(config, {
      iconCls: 'notification-warning'
    });
    
    return this.notify(config);
  },
  
  /**
   * Finds all windows aligned to the given location (defaults to this.alignTo)
   * @param {String} location The location (tl, tr, bl or br) to find windows at
   */
  findAlignedTo: function(location) {
    var location = location || this.alignTo;
    return this.windows.select(function(element) { return element.alignedTo == location;});
  },
      
  positionWindow: function(win) {
    win.el.alignTo(document, this.alignTo + '-' + this.alignTo, this.offsets[this.alignTo]);
  },
  
  /**
   * Returns the window (not the Notification object!  The object including alignment, position and the notification window itself)
   * @param {String} The ID of the window
   * @return {Object} The object with the found window's alignment, position and Notification object
   */
  findWindowById: function(id) {
    return this.windows.detect(function(e) {return e.id == id;});
  },
  
  /**
   * Finds the notification window at the specified position and screen location
   * @param {Number} position The position currently held by the notification window
   * @param {String} location The location of the screen to look at (can be tl, tr, bl and br).  Defaults to current alignTo
   * @return {Object} The window object or null if nothing currently occupies this position
   */
  findWindowByPosition: function(position, location) {
    var location = location || this.alignTo;
    var windows = this.findAlignedTo(location);
    
    return windows.detect(function(e) {return e.position == position;});
  },
  
  removeWindow: function(win) {    
    var removedWindow = this.windows.detect(function(e) {return e.id == win.id;});
    if (removedWindow) { this.windows.remove(removedWindow); }
    
    //return false to cancel the default event handler in Ext.ux.MVC.Notification
    removedWindow.win.close();
    return false;
  },
  
  showWindow: function(win) {
    win.show();
  },
  
  
  /**
   * Convenience methods
   */
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedTopRight: function() {
    return this.findAlignedTo('tr');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedTopLeft: function() {
    return this.findAlignedTo('tl');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedBottomRight: function() {
    return this.findAlignedTo('br');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedBottomLeft: function() {
    return this.findAlignedTo('bl');
  },
  
  /**
   * Private methods
   */
   
  highestTakenPosition: function(location) {
    var location = location || this.alignTo;
    
    var windows = this.findAlignedTo(location);
    
    //get a sorted list of positions already taken up
    var positions = windows.collect(function(e) {return e.position;}).sort();
    
    //return the highest position
    return positions.reverse()[0];
  },
   
  /**
   * Private method - should not need to be used externally
   * Finds the first available position to insert the window to at the given location (location defaults to this.alignTo)
   * @param {String} location The location (tl, tr, bl or br) to the first available position for
   */
  firstAvailablePosition: function(location) {
    var location = location || this.alignTo;
    
    var windows = this.findAlignedTo(location);
    if (windows.length == 0) {return 1;}
    
    //get a sorted list of positions already taken up
    var positions = windows.collect(function(e) {return e.position;}).sort();
    
    //return the first position number which is currently free
    for (var i=0; i < positions.length; i++) {
      //if we can't detect a window in the position one up from here, return that position
      if (!windows.detect(function(e) {return positions[i] + 1 == e.position;})) {
        return positions[i] + 1;
      }
    };
  }
};