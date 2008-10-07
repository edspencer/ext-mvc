/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

Ext.Desktop = function(app){
  var app = app || {};
 
  Ext.applyIf(this, {
    shortcutSize: 90,
    shortcutPadding: 5
  });
 
  this.taskbar = new Ext.ux.TaskBar(app);
  var taskbar = this.taskbar;
 
  var desktopEl = Ext.get('x-desktop');
  var taskbarEl = Ext.get('ux-taskbar');
 
  this.shortcuts = [];

  // var windows = new Ext.WindowGroup();
  var windows = Ext.WindowMgr;
  var activeWindow;
 
  function minimizeWin(win){
      win.minimized = true;
      win.hide();
  }

  function markActive(win){
      if(activeWindow && activeWindow != win){
          markInactive(activeWindow);
      }
      taskbar.setActiveButton(win.taskButton);
      activeWindow = win;
      Ext.fly(win.taskButton.el).addClass('active-win');
      win.minimized = false;
  }

  function markInactive(win){
      if(win == activeWindow){
          activeWindow = null;
          Ext.fly(win.taskButton.el).removeClass('active-win');
      }
  }

  function removeWin(win){
    taskbar.removeTaskButton(win.taskButton);
      layout();
  }

  function layout(){
      desktopEl.setHeight(Ext.lib.Dom.getViewHeight()-taskbarEl.getHeight());
  }
  Ext.EventManager.onWindowResize(layout);

  this.layout = layout;

  this.createWindow = function(config, cls){
    var win = new (cls||Ext.Window)(
          Ext.applyIf(config||{}, {
              manager: windows,
              minimizable: true,
              maximizable: true
          })
      );
      win.render(desktopEl);
      win.taskButton = taskbar.addTaskButton(win);

      win.cmenu = new Ext.menu.Menu({
          items: [

          ]
      });

      win.animateTarget = win.taskButton.el;
     
      win.on({
        'activate': {
          fn: markActive
        },
        'beforeshow': {
          fn: markActive
        },
        'deactivate': {
          fn: markInactive
        },
        'minimize': {
          fn: minimizeWin
        },
        'close': {
          fn: removeWin
        }
      });
     
      layout();
      return win;
  };
  
  this.getManager =function() {
    return windows;
  };
  
  this.getWindow = function(id) {
    return windows.get(id);
  };

  layout();

  // if(shortcuts){
  //     shortcuts.on('click', function(e, t){
  //       if(t = e.getTarget('dt', shortcuts)){
  //           e.stopEvent();
  //           var module = app.getModule(t.id.replace('-shortcut', ''));
  //           if(module){
  //               module.createWindow();
  //           }
  //       }
  //   });
  // }
};

Ext.extend(Ext.Desktop, Ext.util.Observable, {
  
  /**
   * Returns the height in pixels available to the desktop (minus the start bar).
   * Minimum 100px
   */
  getWinHeight: function() {
    var height = (Ext.lib.Dom.getViewHeight()-taskbarEl.getHeight());
    return height < 100 ? 100 : height;
  },
  
  /**
   * Returns the width in pixels available to the desktop.  Minimum 200px
   */
  getWinWidth: function() {
    var width = Ext.lib.Dom.getViewWidth();
    return width < 200 ? 200 : width;
  },
  
  getWinX: function(width) {
    return (Ext.lib.Dom.getViewWidth() - width) / 2;
  },
  
  getWinY: function(height) {
    return (Ext.lib.Dom.getViewHeight()-taskbarEl.getHeight() - height) / 2;
  },
  
  
/**
 *   My customisations below here...
 */
  
  
  /**
   * Returns the maximum number of shortcuts that can appear vertically stacked given
   * the desktop's current height and the size of this.shortcutSize
   */
  shortcutsHigh: function() {
    return parseInt(this.getWinHeight() / this.shortcutSize);
  },
 
  /**
   * Returns the maximum number of shortcuts that can appear horizontally stacked given
   * the desktop's current width and size of this.shortcutSize
   */
  shortcutsWide: function() {
    return parseInt(this.getWinWidth() / this.shortcutSize);   
  },
 
  /**
   * Adds the shortcut config to the specified position or the first available position
   */
  addShortcut: function(config) {
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
      // console.log(shortcuts[i]);
      var pos = shortcuts[i].position;
     
      if (pos > maxPosition) { maxPosition = pos; }
    };
   
    return maxPosition;
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
   * @return {Array} An array of matching shortcuts
   */
  findShortcutsBy: function(fn) {
    var shortcuts = this.shortcuts;
   
    var matches = [];
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (fn.call(this, shortcuts[i]) === true) {
        matches.push(shortcuts[i]);
      };
    };
   
    return matches;
  }
});