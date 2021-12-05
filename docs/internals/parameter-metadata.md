# Parameter Metadata

## Introduction

Parameter metadata can be stored in countless ways. This reflection library uses a specific format which enables the
`getMetadata()` method to work on parameters.

If you are writing your own decorators, consider invoking the `Meta.Parameter` function like below to easily set
metadata in the correct structure.

```ts
import { Meta } from '@baileyherbert/reflection';

export function Decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
	Meta.Parameter('key', 'value')(target, propertyKey, parameterIndex);
}
```

If your decorator only needs to set metadata, you can also directly wrap the `Meta.Parameter` function like below.

```ts
import { Meta } from '@baileyherbert/reflection';

// With static data
export const Decorator = Meta.Parameter('key', 'value');

// With variable data
export const Decorator = (value: string) => Meta.Parameter('key', value);
```

The rest of this page will discuss how metadata is structured internally for this library in case of advanced usage.

## Storage structure

- Parameter metadata is stored on the parent method under the `#!ts "reflection:params"` key
- The value of this key must be `undefined` or an instance of `#!ts Array<Map<any, any>>`
	- The array indices are the indices of the parameters
	- The array values are `Map<any, any>` objects containing the metadata

Refer to the following code sample which sets metadata on a parameter just like the `@Meta.Parameter()` decorator:

## Example

```ts
function ParameterMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
			let parameters = Reflect.getOwnMetadata('reflection:params', target, propertyKey);

			if (parameters === undefined) {
				parameters = new Array<Map<any, any>>();
				Reflect.defineMetadata('reflection:params', parameters, target, propertyKey);
			}

			if (!(parameterIndex in parameters)) {
				parameters[parameterIndex] = new Map();
			}

			parameters[parameterIndex].set(metadataKey, metadataValue);
	};
}
```
