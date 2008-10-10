describe('The Desktop Layout', {
  
  before_each : function() {
    desktop = new Ext.Desktop({
      layout: {
        items: [
          {
            text:     'Shortcut 0',
            position: 0,
            id:       'shortcut-0'
          },
          {
            text:     'Shortcut 1',
            position: 1,
            id:       'shortcut-1'
          },
          {
            text:     'Shortcut 2',
            position: 4,
            id:       'shortcut-2'
          },
          {
            text:     'Shortcut 3',
            position: 8,
            id:       'shortcut-3'
          }
        ]
      }
    });
    
    //stubs
    Ext.override(Ext.Desktop, {
      
      getWinHeight: function() {
        return 540;
      },
      
      getWinWidth: function() {
        return 950;
      }
    });
    
    layout = desktop.layout;
  },
  
  'should have a default shortcut size of 90 pixels': function() {
    value_of(layout.shortcutSize).should_be(90);
  },
  
  'should calculate the number of shortcuts that can appear horizontally': function() {
    value_of(layout.shortcutsWide()).should_be(10); // = 950 / 90
  },
  
  'should calculate the number of shortcuts that can appear vertically': function() {
    value_of(layout.shortcutsHigh()).should_be(6); // = 540 / 90
  },
  
  'should find the first available position for a shortcut to appear at': function() {
    value_of(layout.firstAvailablePosition()).should_be(2);
  },
  
  'should find the first available position after a given start index': function() {
    value_of(layout.firstAvailablePosition(5)).should_be(5);
  },
  
  'should confirm the availability of a shortcut position': function() {
    value_of(layout.shortcutPositionAvailable(3)).should_be(true);
  },
  
  'should confirm the unavailability of a shortcut position': function() {
    value_of(layout.shortcutPositionAvailable(4)).should_be(false);
  },
  
  'should find the position of the highest current shortcut': function() {
    value_of(layout.highestShortcutPosition()).should_be(8);
  },
  
  'should add a shortcut': function() {
    var newShortcut = {
      position: 10,
      text:     'New Shortcut',
      id:       'new-shortcut'
    };
    
    var previousShortcutsCount = layout.shortcuts.length;
    layout.addShortcut(newShortcut); 
    value_of(layout.shortcuts.length).should_be(previousShortcutsCount + 1);
  },
  
  'should add multiple shortcuts': function() {
    var newShortcuts = [
      {
        text: 'First new shortcut',
        id:   'first-new-shortcut'
      },
      {
        text: 'Second new shortcut',
        id:   'second-new-shortcut'
      }
    ];
    
    var previousShortcutsCount = layout.shortcuts.length;
    layout.addShortcuts(newShortcuts);
    value_of(layout.shortcuts.length).should_be(previousShortcutsCount + 2);
  },
  
  'should find a shortcut by its ID': function() {
    var shortcut = layout.findShortcutById('shortcut-1');
    
    value_of(shortcut.text).should_be('Shortcut 1');
  },
  
  'should find shortcuts by an arbitrary search function': function() {
    //mock function to find any shortcut occupying position 2 or higher
    func = function(e) {
      if (e.position >= 2) {return true;};
    };
    
    var results = layout.findShortcutsBy(func);
    
    value_of(results.length).should_be(2);
  },
  
  'should add a new shortcut to the first available position if position is not specified': function() {
    var id = 'some-shortcut-id';
    var config = {
      id:    id,
      text: 'Shortcut text'
    };
    
    layout.addShortcut(config);
    
    //find the newly added shortcut
    var shortcut = layout.findShortcutById(id);
    
    //positions 0 and 1 are taken already
    value_of(shortcut.position).should_be(2);
  }
});