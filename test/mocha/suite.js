// mocha/suite.js

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