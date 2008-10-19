describe("The changelog", {
  before_each: function() {
    firstArray  = ['a', 'b', 'c'];
    firstString = "Some change";
    
    log = new Ext.ux.ChangeLog({
      new Date(2008, 5, 13): firstArray,
      new Date(2008, 5, 15): firstString
    });
  },
  
  'should add changelog items from constructor': function() {
    value_of(log.items.length).should_be(2);
    value_of(log.items.first()).should_be(firstArray);
  },
  
  'should add changelog items after construction': function() {
    previous_value = log.items.length;
    log.addItem(new Date(2008, 5, 16), 'Some change');
    
    value_of(log.items.length).should_be(previous_value + 1);
  },
  
  'should return an array of all changelog items added after the given date': function() {
    var res = log.sinceDate(new Date(2008, 5, 14));
    value_of(res.length).should_be(1);
    value_of(res.first()).should_be(firstString);
  }
});