# Parameter reflection

## Retrieving an instance

Retrieve an instance from the parent method using [`getParameter()`](methods.md#method:getParameter) or
[`getParameters()`](methods.md#method:getParameters). It is not possible to manually instantiate a reflection
parameter.

## Properties

### `#!ts method: ReflectionMethod` { data-toc-label="method", id="property:method" }

> The [`ReflectionMethod`](methods.md) instance that this parameter belongs to.

### `#!ts index: number` { data-toc-label="index", id="property:index" }

> The parameter index as an integer. The first parameter in a method will have the index `0`.

### `#!ts name: string` { data-toc-label="name", id="property:name" }

> The name of the parameter.

### `#!ts hasDefault: boolean` { data-toc-label="hasDefault", id="property:hasDefault" }

> Whether or not the parameter has an ES6 default value.

### `#!ts isPrimitiveType: boolean` { data-toc-label="isPrimitiveType", id="property:isPrimitiveType" }

> Whether or not the parameter is a primitive type such as a `string`, `number`, `bigint`, `boolean`, `symbol`, or
> `undefined`. Please note that this does not include generic `object` types due to metadata limitations.

### `#!ts isKnownType: boolean` { data-toc-label="isKnownType", id="property:isKnownType" }

> Whether or not the parameter has a known and non-generic type. This will return false for generic objects, generic
> functions, `null`, and `undefined`.

### `#!ts isClassType: boolean` { data-toc-label="isClassType", id="property:isClassType" }

> Whether or not the parameter accepts an instance of a class.

## Parameter type

### `#!ts getType()` { id="method:getType" }

> Returns the parameters's expected type as it was defined by the TypeScript compiler. When type information is not
> available, or when the parameter does not define a type, `undefined` will be returned instead.
>
> - When a parameter accepts multiple types, this will return a generic `Object`
> - When a parameter accepts a class instance, this will return the class constructor
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (parameter.getType() === String) {}
if (parameter.getType() === undefined) {}
```

### `#!ts getTypeString()` { id="method:getTypeString" }

> Returns the parameters's expected type as a string. This will be identical to what the `typeof` operator would
> produce.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (parameter.getTypeString() === 'string') {}
if (parameter.getTypeString() === 'undefined') {}
```

## Retrieving attributes

This library has a powerful alternative to decorators called [attributes](attributes.md). You can use the following
methods to retrieve attribute instances that have been applied to a parameter.

### `#!ts getAttributes(attribute?: IAttribute<any>)` { data-toc-label="getAttributes()", id="method:getAttributes" }

> Returns an array of instances of the specified attribute on the parameter. When the `attribute` argument is not
> supplied, it will return all attributes on the parameter.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name        | Type                   | Description                            | Default     |
| ----------- | ---------------------- | -------------------------------------- | ----------- |
| `attribute` | `#!ts IAttribute<any>` | A reference to the attribute function. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
for (const attribute of parameter.getAttributes(ExampleAttribute)) {
	// Do something
}
```

### `#!ts getAttribute(attribute: IAttribute<any>)` { data-toc-label="getAttribute()", id="method:getAttribute" }

> Returns an instance of the specified attribute on the parameter or `undefined` if not found. Only the last instance
> (the instance declared in the code last) will be returned.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name        | Type                   | Description                            | Default    |
| ----------- | ---------------------- | -------------------------------------- | ---------- |
| `attribute` | `#!ts IAttribute<any>` | A reference to the attribute function. | *required* |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const latest = parameter.getAttributes(ExampleAttribute);
```

### `#!ts hasAttribute(attribute: IAttribute<any>)` { data-toc-label="hasAttribute()", id="method:hasAttribute" }

> Returns true if the parameter has any attributes of the specified type applied.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name        | Type                   | Description                            | Default    |
| ----------- | ---------------------- | -------------------------------------- | ---------- |
| `attribute` | `#!ts IAttribute<any>` | A reference to the attribute function. | *required* |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (parameter.hasAttribute(ExampleAttribute)) {
	// Do something!
}
```

## Managing metadata

These methods use the `reflect-metadata` library under the hood. You can use the [`@Meta`](../decorators/Meta.md)
decorator built into this package, or refer to the
[TypeScript Handbook on Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), to set metadata on
your parameters.

!!! warning
	Parameter metadata is stored on the method in no particular format. It is therefore extremely important that
	you use the [`@Meta()`](../decorators/Meta.md#variation:smart) or
	[`@Meta.Parameter()`](../decorators/Meta.md#variation:parameter) decorators in this package to set parameter
	metadata in a format that the below methods can understand.

	To learn more about the format we expect, and how to write your own compatible parameter decorators, check out the
	[parameter metadata](../internals/parameter-metadata.md) internals guide.

### `#!ts getMetadata(key: any)` { data-toc-label="getMetadata()", id="method:getMetadata" }

> Returns the value of a metadata key on the parameter.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |

### `getAllMetadata()` { id="method:getAllMetadata" }

> Returns a [`#!ts Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
> containing all metadata on the parameter.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const meta = reflect.getAllMetadata();
const value = meta.get('key');
```

### `#!ts setMetadata(key: any, value: any)` { data-toc-label="setMetadata()", id="method:setMetadata" }

> Sets the value of a metadata key on the parameter.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name    | Type  | Description                                                         | Default    |
| ------- | ----- | ------------------------------------------------------------------- | ---------- |
| `key`   | `any` | The key to set data for.                                            | *required* |
| `value` | `any` | The data to store under the key. Existing data will be overwritten. | *required* |

### `#!ts hasMetadata(key: any)` { data-toc-label="hasMetadata()", id="method:hasMetadata" }

> Returns `true` if this parameter has metadata matching the given key.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |
