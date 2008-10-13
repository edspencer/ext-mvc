describe('String methods', {
  'should capitalise a word': function() {
    value_of('test'.capitalize()).should_be('Test');
  },
  'should capitalise only the first word in a sentence': function() {
    value_of("the sentence".capitalize()).should_be("The sentence");
  },
  'should titleize a sentence': function() {
    value_of("this is a sentence".titleize()).should_be("This Is A Sentence");
  },
  'should camelize a simple string': function() {
    value_of('classname'.camelize()).should_be('Classname');
  },
  'should camelize a long string': function() {
    value_of('long_class_name'.camelize()).should_be('LongClassName');
  },
  'should truncate a string': function() {
    value_of('my long string'.truncate(10)).should_be('my long...');
  },
  'should truncate a string with a custom trailing string': function() {
    value_of('my long string'.truncate(12, '!!')).should_be('my long st!!');
  }
});