// mocha/suite.js

var assert = assert;

if (typeof require == 'function') {
  require('../../../stringtemplate');

  assert = require('assert');
}

/* TESTS START HERE */

suite('smoke test');

test('exists', function () {
  assert(typeof ''.template == 'function');
  assert(typeof (function(){}).template == 'function');
});

/*
  template() accepts 
  + string
  + object
  + array of strings or objects
  
  template() returns
  + ?monad? with a .toString() method that returns the finished string
  + string
*/