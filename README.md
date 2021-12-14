# Reflection

This is a reflection library for TypeScript!

Do you hate writing decorators but love their power? How about all the work required to get the type a method returns
or a parameter expects? This library makes it simple to write decorators, and to access metadata and type information
from classes, methods, properties, and parameters.

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

Check out the **[documentation website](https://docs.bailey.sh/reflection/latest/)**.

## Examples

### Methods, properties, and parameters

Check out this pointless example that iterates over the methods, properties, and parameters in a class.

```ts
import { ClassName } from './ClassName';
const ref = new ReflectionClass(ClassName);

for (const method of ref.getMethods()) {
    const returns = method.getReturnType();
    const params = method.getParameters().map(param => param.getType());

    console.log('Method:', method.name);
    console.log('Returns:', returns);
    console.log('Accepts:', params);
}

for (const property of ref.getProperties()) {
    if (property.hasMetadata('key')) {
        // Create something cool!
    }
}
```

### Dependency injection

This is a very oversimplified example that creates instances of a class's expected dependencies and then constructs a
new instance with them.


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

### Metadata

Setting metadata doesn't have to be difficult. Just use the included `@Meta()` decorator.

This has a few advantages. Most importantly, it writes metadata in a consistent format that the reflection library can
natively understand, including for properties and parameters.

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

```ts
const ref = new ReflectionClass(Example);
ref.getMetadata('key'); // 'value'

const method = ref.getMethod('method')!;
method.getMetadata('key'); // 'value'
```
