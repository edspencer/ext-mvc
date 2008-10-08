describe('The Notification Manager', {
  before_all: function() {
    man = Ext.ux.MVC.NotificationManager;
    
    //add some fake windows to test finder functions
    man.windows.push({
      alignedTo: 'tl',
      id:        'top-left-window',
      position:  1
    });
    
    man.windows.push({
      alignedTo: 'tr',
      id:        'top-right-window',
      position:  1
    });
    
    man.windows.push({
      alignedTo: 'bl',
      id:        'bottom-left-window',
      position:  1
    });
    
    man.windows.push({
      alignedTo: 'br',
      id:        'bottom-right-window-1',
      position:  1
    });
    
    man.windows.push({
      alignedTo: 'br',
      id:        'bottom-right-window-2',
      position:  2
    });
  },
  
  'should allow alignTo to be set to tl, tr, bl and br only': function() {
    ['tl', 'tr', 'bl', 'br'].each(function(e) {
      man.setAlignTo(e);
      value_of(man.alignTo).should_be(e);
    });
    
    ['some', 'other', 'values', 'that', 'will', 'never', 'work'].each(function(e) {
      value_of(man.alignTo).should_not_be(e);
    });
  },
  
  'should find all windows positioned at the top left of the window': function() {
    var windows = man.alignedTopLeft();
    value_of(windows.length).should_be(1);
    value_of(windows[0].id).should_be('top-left-window');
  },
  
  'should find all windows positioned at the top right of the window': function() {
    var windows = man.alignedTopRight();
    value_of(windows.length).should_be(1);
    value_of(windows[0].id).should_be('top-right-window');
  },
  
  'should find all windows positioned at the bottom left of the window': function() {
    var windows = man.alignedBottomLeft();
    value_of(windows.length).should_be(1);
    value_of(windows[0].id).should_be('bottom-left-window');
  },
  
  'should find all windows positioned at the bottom right of the window': function() {
    var windows = man.alignedBottomRight();
    value_of(windows.length).should_be(2);
    
    //make sure both ids are present
    value_of(windows.detect(function(e) {return e.id == 'bottom-right-window-1';}).id).should_be('bottom-right-window-1');
    value_of(windows.detect(function(e) {return e.id == 'bottom-right-window-2';}).id).should_be('bottom-right-window-2');
  },

  'should find all windows positioned at the currently set alignTo location': function() {
    value_of(man.findAlignedTo()).should_be(man.findAlignedTo(man.alignTo));
  },
  
  'should find the highest taken position at the top left': function() {
    value_of(man.highestTakenPosition('tl')).should_be(1);
  },
  
  'should find the highest taken position at the top right': function() {
    value_of(man.highestTakenPosition('tr')).should_be(1);
  },
  
  'should find the highest taken position at the bottom left': function() {
    value_of(man.highestTakenPosition('bl')).should_be(1);
  },
  
  'should find the highest taken position at the bottom right': function() {
    value_of(man.highestTakenPosition('br')).should_be(2);
  },
  
  'should find the highest taken position at the currently set alignTo location': function() {
    value_of(man.highestTakenPosition()).should_be(man.highestTakenPosition(man.alignTo));
  },
  
  'should find the first available position at the top left': function() {
    value_of(man.firstAvailablePosition('tl')).should_be(2);
  },
  
  'should find the first available position at the top right': function() {
    value_of(man.firstAvailablePosition('tr')).should_be(2);
  },
  
  'should find the first available position at the bottom left': function() {
    value_of(man.firstAvailablePosition('bl')).should_be(2);
  },
  
  'should find the first available position at the bottom right': function() {
    value_of(man.firstAvailablePosition('br')).should_be(3);
  },
  
  'should use the current alignTo position as the default value when calling firstAvailablePosition': function() {
    value_of(man.firstAvailablePosition()).should_be(man.firstAvailablePosition(man.alignTo));
  },
  
  'should find the notification window at the given position and location': function() {
    value_of(man.findWindowByPosition(1, 'tl').id).should_be('top-left-window');
    value_of(man.findWindowByPosition(1, 'tr').id).should_be('top-right-window');
    value_of(man.findWindowByPosition(1, 'bl').id).should_be('bottom-left-window');
    value_of(man.findWindowByPosition(1, 'br').id).should_be('bottom-right-window-1');
    value_of(man.findWindowByPosition(2, 'br').id).should_be('bottom-right-window-2');
    
    value_of(man.findWindowByPosition(1)).should_be(man.findWindowByPosition(1, man.alignTo));
  },
  
  'should find a window by its ID': function() {
    //may look a little silly, but this does actually check what we're trying to check!
    value_of(man.findWindowById('top-right-window').id).should_be('top-right-window');
  }
});