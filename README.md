# @baileyherbert/reflection

This is a reflection library for TypeScript!

Do you hate writing decorators but love their power? How about all the work required to get the type a method returns
or a parameter expects? This library makes it simple to write decorators, and to access metadata and type information
from classes, methods, and parameters.

## Take a tour

Check out this pointless example:

```ts
import { ClassName } from './ClassName';
const reflection = new ReflectionClass(ClassName);

if (reflection.hasMetadata('key')) {
    for (const method of reflection.getMethods()) {
        const params = method.getParameters();
    }
}
```

Or how about some very simple dependency injection?

```ts
// Get our constructor method in a line
const constructor = reflection.getConstructorMethod();

// Then get its parameter types and instantiate them
const params = constructor.getParameters();
const types = params.map(param => param.getType());
const objects = types.map(type => new type());

// Voila!
const instance = reflection.create(objects);
```

Perhaps you're a fan of metadata? Just use the included `@Meta()` decorator!

```ts
import { Meta } from '@baileyherbert/reflection';
const Custom = (value: any) => Meta('key', value);

@Meta('key', 'value')
export class Example {
    @Custom('value')
    public method() {

    }
}
```

## Getting started

Install the package into your project:

```plain
npm install @baileyherbert/reflection
```

Then configure your `tsconfig.json` file as follows if you want metadata and type reflection:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }
}
```

## Documentation

Check out the [documentation website](https://docs.bailey.sh/reflection/)!
