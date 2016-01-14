Electrode Documentation Generator
=================================

A custom metadata extractor for the Electrode framework.

> Before getting started, please make sure you read the [React Developer Guide](https://gecgithub01.walmart.com/react/react-dev-guide)!

## Running it

```
electrode-docgen --package ./package.json --src ./src --metadata components.json
```

```
electrode-docgen --package ./package.json --src ./src --markdown components.md
```

Or in `package.json`

```
  "scripts": {
    ...
    "generate": "npm run generate-metadata && npm run generate-documentation && npm run generate-demo",
    "generate-metadata": "electrode-docgen --package ./package.json --src ./src --metadata components.json",
    "generate-documentation": "electrode-docgen --package ./package.json --src ./src --markdown components.md",
    "generate-demo": "electrode-docgen --package ./package.json --src ./src --demo demo"
  }
```

## Writing It

Standard Markdown format in the description.

### Metadata

```
@component Fixie
@import {Fixie}
```

### Private components

```
@private
```

### Playgrounds

```
@playground
Fixie
``
<div>
</div>
``
```

And for `noRender` set to `false`.

```
@playground
Fixie
!noRenderFalse!
``
<div>
</div>
``
```

***NOTE***: In order to generate documentation correctly there should not be any statements between your documentation comment and React class declaration, for e.g.

```
// GOOD

const foo = [];

/*JSDoc comment*/

class Foo extends React.Component {...}
```

```
// BAD

/*JSDoc comment*/

const foo = [];

class Foo extends React.Component {...}
```

## Auto generated demo

```
/// start imports
/// end imports
```

```
/// start render
/// end render
```

## Issues

Before submitting an issue, please see the [Issue Submission Guidelines](https://gecgithub01.walmart.com/react/react-dev-guide#submitting-issues)

## Contributing

If you're interested in contributing, see the [React Developer Guide's Contribution Guide](https://gecgithub01.walmart.com/react/react-dev-guide#contributing)
