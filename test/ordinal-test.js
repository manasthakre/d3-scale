var tape = require("tape"),
    scale = require("../");

tape("ordinal() has the expected defaults", function(test) {
  var s = scale.ordinal();
  test.deepEqual(s.domain(), []);
  test.deepEqual(s.range(), []);
  test.equal(s(0), undefined);
  test.deepEqual(s.domain(), [0]);
  test.end();
});

tape("ordinal(x) maps a unique name x in the domain to the corresponding value y in the range", function(test) {
  var s = scale.ordinal().domain([0, 1]).range(["foo", "bar"]);
  test.equal(s(0), "foo");
  test.equal(s(1), "bar");
  var s = scale.ordinal().range(["a", "b", "c"]);
  test.equal(s(0), "a");
  test.equal(s("0"), "a");
  test.equal(s([0]), "a");
  test.equal(s(1), "b");
  test.equal(s(2.0), "c");
  test.equal(s(new Number(2)), "c");
  test.end();
});

tape("ordinal(x) implicitly extends the domain when a range is explicitly specified", function(test) {
  var s = scale.ordinal().range(["foo", "bar"]);
  test.deepEqual(s.domain(), []);
  test.equal(s(0), "foo");
  test.deepEqual(s.domain(), [0]);
  test.equal(s(1), "bar");
  test.deepEqual(s.domain(), [0, 1]);
  test.equal(s(0), "foo");
  test.deepEqual(s.domain(), [0, 1]);
  test.end();
});

tape("ordinal.domain() replaces previous domain values", function(test) {
  var s = scale.ordinal().range(["foo", "bar"]);
  test.equal(s(1), "foo");
  test.equal(s(0), "bar");
  test.deepEqual(s.domain(), [1, 0]);
  s.domain(["0", "1"]);
  test.equal(s(0), "foo"); // it changed!
  test.equal(s(1), "bar");
  test.deepEqual(s.domain(), ["0", "1"]);
  test.end();
});

tape("ordinal.domain() uniqueness is based on string coercion", function(test) {
  var s = scale.ordinal().domain(["foo"]).range([42, 43, 44]);
  test.equal(s(new String("foo")), 42);
  test.equal(s({toString: function() { return "foo"; }}), 42);
  test.equal(s({toString: function() { return "bar"; }}), 43);
  test.end();
});

tape("ordinal.domain() does not coerce domain values to strings", function(test) {
  var s = scale.ordinal().domain([0, 1]);
  test.deepEqual(s.domain(), [0, 1]);
  test.equal(typeof s.domain()[0], "number");
  test.equal(typeof s.domain()[1], "number");
  test.end();
});

tape("ordinal.domain() does not barf on object built-ins", function(test) {
  var s = scale.ordinal().domain(["__proto__", "hasOwnProperty"]).range([42, 43]);
  test.equal(s("__proto__"), 42);
  test.equal(s("hasOwnProperty"), 43);
  test.deepEqual(s.domain(), ["__proto__", "hasOwnProperty"]);
  test.end();
});

tape("ordinal.domain() is ordered by appearance", function(test) {
  var s = scale.ordinal();
  s("foo");
  s("bar");
  s("baz");
  test.deepEqual(s.domain(), ["foo", "bar", "baz"]);
  s.domain(["baz", "bar"]);
  s("foo");
  test.deepEqual(s.domain(), ["baz", "bar", "foo"]);
  s.domain(["baz", "foo"]);
  test.deepEqual(s.domain(), ["baz", "foo"]);
  s.domain([]);
  s("foo");
  s("bar");
  test.deepEqual(s.domain(), ["foo", "bar"]);
  test.end();
});

tape("ordinal.range() setting the range remembers previous values", function(test) {
  var s = scale.ordinal();
  test.equal(s(0), undefined);
  test.equal(s(1), undefined);
  s.range(["foo", "bar"]);
  test.equal(s(0), "foo");
  test.equal(s(1), "bar");
  test.end();
});

tape("ordinal.range() recycles values when exhausted", function(test) {
  var s = scale.ordinal().range(["a", "b", "c"]);
  test.equal(s(0), "a");
  test.equal(s(1), "b");
  test.equal(s(2), "c");
  test.equal(s(3), "a");
  test.equal(s(4), "b");
  test.equal(s(5), "c");
  test.equal(s(2), "c");
  test.equal(s(1), "b");
  test.equal(s(0), "a");
  test.end();
});

// tape("ordinal.rangeExtent() returns the continuous range", function(test) {
//   test.deepEqual(scale.ordinal().domain(["a", "b", "c"]).rangePoints([20, 120]).rangeExtent(), [20, 120]);
//   test.deepEqual(scale.ordinal().domain(["a", "b", "c"]).rangeBands([10, 110]).rangeExtent(), [10, 110]);
//   test.deepEqual(scale.ordinal().domain(["a", "b", "c"]).rangeRoundBands([0, 100]).rangeExtent(), [0, 100]);
//   test.deepEqual(scale.ordinal().domain(["a", "b", "c"]).range([0, 20, 100]).rangeExtent(), [0, 100]);
//   test.end();
// });

// tape("ordinal.rangeExtent() can handle descending ranges", function(test) {
//   test.deepEqual(scale.ordinal().domain(["a", "b", "c"]).rangeBands([100, 0]).rangeExtent(), [0, 100]);
//   test.end();
// });

tape("ordinal.copy() changes to the domain are isolated", function(test) {
  var s1 = scale.ordinal().range(["foo", "bar"]),
      s2 = s1.copy();
  s1.domain([1, 2]);
  test.deepEqual(s2.domain(), []);
  test.equal(s1(1), "foo");
  test.equal(s2(1), "foo");
  s2.domain([2, 3]);
  test.equal(s1(2), "bar");
  test.equal(s2(2), "foo");
  test.deepEqual(s1.domain(), [1, 2]);
  test.deepEqual(s2.domain(), [2, 3]);
  test.end();
});

tape("ordinal.copy() changes to the range are isolated", function(test) {
  var s1 = scale.ordinal().range(["foo", "bar"]),
      s2 = s1.copy();
  s1.range(["bar", "foo"]);
  test.equal(s1(1), "bar");
  test.equal(s2(1), "foo");
  test.deepEqual(s2.range(), ["foo", "bar"]);
  s2.range(["foo", "baz"]);
  test.equal(s1(2), "foo");
  test.equal(s2(2), "baz");
  test.deepEqual(s1.range(), ["bar", "foo"]);
  test.deepEqual(s2.range(), ["foo", "baz"]);
  test.end();
});
