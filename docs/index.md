# Introduction

## Welcome!

This is the documentation for [`@baileyherbert/reflection`](https://npmjs.com/@baileyherbert/reflection). This library
allows you to perform reflection at runtime for classes, methods, and parameters. It also makes it simple to work with
metadata as well as return and parameter types.

```ts
import { ReflectionClass } from '@baileyherbert/reflection';
import { ClassName } from './exampleClass';

const reflect = new ReflectionClass(ClassName);

// Instantiate new instances
const instance = reflect.create(...args);

// Manage class metadata
// These are available for methods and parameters too!
reflect.hasMetadata('key');
reflect.getMetadata('key');

// Get information about methods
reflect.getMethods().map(method => method.name);

// And about parameters!
reflect.getMethod('constructor').getParameters().map(param => param.getType());
```

## Getting started

Install the package into your project:

```plain
npm install @baileyherbert/reflection
```

Then configure your `tsconfig.json` file if you want metadata and type reflection:

```json
{
	"compilerOptions": {
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true,
	}
}
```
