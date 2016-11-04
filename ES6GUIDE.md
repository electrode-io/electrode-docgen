es6-guide
=========

A guide to ES6

## Functions

### Arrow functions

Arrow functions are shorthand for an anonymous function that keep the current context. E.g.

```
// Drastically simplified for effect
this.a = 2;

let multiply = function (num) {
  return num * this.a;
}.bind(this);

console.log(multiply(3)) // outputs 6
```

Can be written as

```
this.a = 2;

let multiply = num => num * this.a;

console.log(multiply(3)) // outputs 6
```

This is most useful for cases like map or reduce:

```
let numbers = [1, 2, 3, 4];
let doubled = numbers.map(number => number * 2); // [2, 4, 6, 8]
```

### Arrow function syntax

Arrow functions take the following form: `(<arguments>) => <return statement>`. When there is only a single argument, the parens are optional e.g. `(x) => x * x` and `x => x * x` are both valid. When there are 0 or 2 or more arguments, parens are required. e.g. `() => "blah"` or `(x, y) => x * y`

### Concise methods

In object literals and classes we can condense `render: function() {}` to `render() {}`

### Generators

Generators functions take the following form

```
function* name() {}

// or the preferred
let name = function* () {};
// ...since we avoid function declarations in favor of function expressions

```

Calling a generator doesn't actually run any of it's contents. A call to a generator returns a generator instance.

```
let foo = function* () {
  console.log("foo");
}

// No console output here
let bar = foo();

// bar is now an instance of the generator and the console.log has never been run.
```

To use a generator instance we have to call `.next()`

```
let foo = function* () {
  console.log("foo");
}

// No console output here
let bar = foo();

// outputs "foo"
bar.next();
```

`next()` returns an object that looks like this:
```
{
  value: undefined,
  done: true
}
```

What do `value` and `done` mean? Glad you asked, `done` means that the generator doesn't have any more code to execute. AKA we are past the last `yield` statement. To understand `value`, we have to look at `yield`.

```
let foo = function* (x) {
  yield x;
}

let bar = foo(3);

console.log(bar.next());
// Output is {value: 3, done: false}

console.log(bar.next());
// Output is {value: undefined, done: true}
```

A `yield` statement tells the generator to stop executing and return the following value. You can have `yield` statements without a return value. The generator will return `done: true` on the subsequent call to `next` after the last `yield` statement (see above).

`yield` statements can also be used to pass in new information to the generator.

```
let foo = function* (x) {
  let y = x + yield x;

  return y;
}

let bar = foo(5);

console.log(bar.next().value) // outputs 5 from 'yield x'

console.log(bar.next(8).value) //outputs 13 from 'let y = <x=5> + <yield x=8>'
```

A little confusing right? What happens when we hit the first `yield` is we pass out `x` as `value`. The `yield x` statement then becomes whatever is passed into `.next()`. `x` is still `5` but `yield x` is now `8`.

Note: `return` statements in generators are not a good idea. Although they are easy to reason about for `done: true`, they don't show up in `for..of` loops. See below

Generators can be used with `for..of` loops for iterating to completion

```
// Oversimplified example for effect
let foo = function* (x) {
  yield x + 1;
  yield x + 2;
  yield x + 3;

  // Any return statement here would be ignored by the for..of loop
}

for (let y of foo(6)) {
  console.log(y);
}
// Output
// 7
// 8
// 9
```

For a more detailed overview of generators see http://davidwalsh.name/es6-generators

## Object literals

### Shorthand

`{name: name, title: title}` can be condensed to `{name, title}`
