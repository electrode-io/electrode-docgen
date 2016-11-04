Walmart React Dev Guide
=========================

- [Goals](#goals)
- [Submitting Issues](#submitting-issues)
- [Contributing](#contributing)
  - [Running the code](#running-the-code)
  - [Testing](#testing)
- [PR Process](#pr-process)
  - [Before You PR!](#before-you-pr)
  - [Submitting a PR](#submitting-a-pr)
    - [Assign your PRs](#assign-your-prs)
    - [Conventions](#conventions)
- [Walmart React Code Style](#walmart-react-code-style)
  - [Five Lines](#five-lines)
  - [File Naming](#file-naming)
  - [Method Organizations](#method-organizations)
  - [displayName](#displayname)
  - [Conditional HTML](#conditional-html)
  - [JSX as a Variable or Return Value](#jsx-as-a-variable-or-return-value)
  - [Self-Closing Tags](#self-closing-tags)
  - [List Iterations](#list-iterations)
  - [Formatting Attributes](#formatting-attributes)
- [ES6](#es6)
- [When In Doubt](#when-in-doubt)

## Goals

The high level goals and ideals of this are:

* Give developers a resource of best practices and processes
* Make it clear about what we expect from good code.
* Deliver consistency across the code base.
* Make it easier for engineers to get through the PR process the first time.
* Create code that works, is modern and performant, is maintainable, and clearly expresses its function and the intent of the author.

## Submitting Issues

When submitting an issue to any `electrode-io/*` projects, please provide a good description of your issue along with the following information:

- `Node` version (`node -v`)
- `npm` version (`npm -v`)
- Relevant logs from the output of your issue
- Any `error` output in either terminal or the browser console
  - Browser & browser version you experience issue in (if applicable)

This will help the developers of that project have the information they need to move forward to fix your issue.

## Contributing

The purpose of these libraries is to provide a set of React components to simplify development on top of the Electrode. This includes wrapping all of the controls, as well as responsive helpers, and form validation. The guiding philosophy is; *We write more code so that you write less code*.

Be sure to read the [PR process](#pr-process) before submitting code for review.

### Running the code

Run the demo with watch task.
```sh
% gulp hot
```

Run the demo without watch task.
```sh
% gulp demo
```

These will launch the demo page on http://localhost:4000/

### Testing

We want all of the components in this library to be fully tested and have at least 80% function and conditional coverage. We use mocha for the tests and there is one test specification per component.

To run the tests:

```sh
% gulp test
```

## PR Process

### Before You PR!

```sh
% gulp test
```

Make sure your code *has tests*, passes those tests, and that all of the other components pass their tests, and that the lint runs completely clean. It is acceptable to disable `new-cap`, `no-unused-vars`, `guard-for-in` and `no-unused-expressions` if required. But it not acceptable to disable eslint entirely.

Functional coverage must be above 90% overall.

### Submitting a PR

#### Assign your PRs

Assign your PRs to a single person. If needed, tag that person on the pull request.

#### Conventions

PRs should follow the naming convention of `[MAJOR]`, `[MINOR]`, `[PATCH]` followed by a short description, ending with any relevant Jira or Github issue. E.g. `[MINOR] add color property github199`.

The prefix of the title should be based on how the PR will impact the [semantic version](http://semver.org/) of the package. The size of the changes are unimportant. The only things that matters is how the API has changed - in short:

* Use `[MAJOR]` when you make incompatible API changes. This includes changing type signatures on returns types or arguments, or renaming or deleting components or methods -- even if they are "not used". A good rule of thumb is to ask if running the previous release's tests against the current candidate's code will break.
* Use `[MINOR]` when you add functionality in a backwards-compatible manner. For example adding methods, components or optional arguments.
* Use `[PATCH]` version when you make backwards-compatible non-feature changes (i.e. bug fixes, performance enhancements et cetera).

In the PR comment include a short description of changes, any relevant screenshots, and a `cc/` list of people who should see the PR. Put the assigned reviewer's name first.


## Walmart React Code Style

This is our recommendation for React code. It's based on [https://reactjsnews.com/react-style-guide-patterns-i-like](https://reactjsnews.com/react-style-guide-patterns-i-like).

### Five Lines

How big should a method be? How long should a section of JSX be? Think no more than 5 lines. At the point at which you hit five lines think, should I refactor this? And then refactor it.

### File Naming

All JSX files should have the extension `.jsx` instead of `.js` for ease of identification, compiling and so on.

### Method Organizations

We lay out the methods of a component in life-cycle order:

```js
React.createClass({
  displayName : '',
  mixins: [],
  propTypes: {},
  statics: {},
  getDefaultProps() {},
  getInitialState() {},
  componentWillMount() {},
  componentDidMount() {},
  componentWillReceiveProps() {},
  shouldComponentUpdate() {},
  componentWillUpdate() {},
  componentDidUpdate() {},
  componentWillUnmount() {},
  _getFoo() {},
  _fooHelper() {},
  _onClick() {},
  render() {}
});
```

Event handlers go before the render. Ideally `render` is always the last method. Sub-renders, like `_renderItem()` would go above the main `render()` method.

Prepend custom functions with an underscore.

### displayName

`displayName` is required and should match the class/file name and how it would appear in JSX. E.g. `displayName: 'Accordion'` or `displayName: 'RadioGroup'`.

Nested components need to have a `displayName` that matches the way it would appear in JSX e.g. `displayName: 'Accordion.Item'`

### Conditional HTML

For hiding/showing content we most often choose to use conditional CSS classes, usually with a `hide-content` class, so that there is minimal impact on the DOM as the element is hidden and shown.

However, in the case where you want to remove an item from the DOM follow this pattern when the code is fairly simple:

```js
{this.state.show && 'This is Shown'}
```

Or

```js
{this.state.on ? 'On' : 'Off'}
```

For more complex examples create a local variable and add that to the render:

```js
let dinosaurHtml = '';
if (this.state.showDinosaurs) {
  dinosaurHtml = (
    <section>
      <DinosaurTable />
      <DinosaurPager />
    </section>
  );
}

return (
  <div>
    ...
    {dinosaurHtml}
    ...
  </div>
);
```

### JSX as a Variable or Return Value

JSX spanning multiple lines should be wrapped in parentheses like so:

```js
const multilineJsx = (
  <header>
    <Logo />
    <Nav />
  </header>
);
```

JSX spanning a single line can disregard the parentheses,

```
const singleLineJsx = <span>Simple JSX</span>;
```

but anything complicated or with a likeliness of expanding could be wrapped in parentheses for readability/convenience.

### Self-Closing Tags

Components without children should simply close themselves, as above with Logo,

```js
<Logo />
```

as opposed to the unnecessarily more verbose

```js
<Logo></Logo>
```

### List Iterations

I used to do my list iterations like above in dinosaurHtml. I've realized that list iterations are better done inline, especially if each list item will be rendered as a component. You may even be able to reduce to one line with fat arrows:

```js
render() {
  return (
    <ul>
      {this.state.dinosaursList.map(dinosaur => <DinosaurItem item={dinosaur} />)}
    </ul>
  );
}
```

Super clean ES6 syntax. So we like that a lot.

### Formatting Attributes

Instead of the long input element above, a cleaner and easier indentation would be:

```js
<input
  type="text"
  value={this.state.newDinosaurName}
  onChange={this.inputHandler.bind(this, 'newDinosaurName')} />
```

Note the two space indent. This makes sense for us because our component names can get long.


## ES6

We like ES6 a lot and we prefer its use over the often more verbose ES5. For details check out the ES6 guide https://github.com/electrode-io/electrode-docgen/blob/master/ES6GUIDE.md

* We prefer `const` over `let` over `var` - `var` is considered deprecated.
* We prefer dropping the `function` keyword when possible.
* We prefer dropping `function` and using the fat arrow/dash rocket (`=>`) syntax instead.
* We prefer `import` and `export` over `require` and `module.exports`.
* We like the spread operator. And prefer to see `{... this.props}` when it's appropriate in the `render`.


## When In Doubt

* Breathe.
* Do what works.
* Do what is simple.
* Ask the question on github. We are friendly. We don't bite.
* Drink lots of water and eat leafy greens.
* Realize that life is fleeting.
* Go for a run.
* Grill.
