Electrode Documentation Generator
=================================

A custom metadata extractor for the Electrode framework.

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
    "generate": "npm run generate-metadata && npm run generate-documentation",
    "generate-metadata": "electrode-docgen --package ./package.json --src ./src --metadata components.json",
    "generate-documentation": "electrode-docgen --package ./package.json --src ./src --markdown components.md"
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
