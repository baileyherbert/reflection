# Method reflection

## Retrieving an instance

Retrieve an instance from the parent class using [`getMethod()`](classes.md#method:getMethod) or
[`getMethods()`](classes.md#method:getMethods). It is not possible to manually instantiate a reflection method.

## Properties

### `#!ts name: string` { data-toc-label="name", id="property:name" }

> The name of the method as a string.

### `#!ts class: ReflectionClass` { data-toc-label="class", id="property:class" }

> The class that this method belongs to.

### `#!ts isConstructor: boolean` { data-toc-label="isConstructor", id="property:isConstructor" }

> Whether or not the method is the constructor for the class.

### `#!ts isStatic: boolean` { data-toc-label="isStatic", id="property:isStatic" }

> Whether or not the method is static.

### `#!ts isTyped: boolean` { data-toc-label="isTyped", id="property:isTyped" }

> Whether or not the method has type metadata available from TypeScript.

### `#!ts prototype: Object` { data-toc-label="prototype", id="property:prototype" }

> A reference to the underlying class prototype.

### `#!ts target: Function` { data-toc-label="target", id="property:target" }

> A reference to the method's function on the class prototype.

## Invoking methods

### `#!ts getClosure(object?: T | null)` { data-toc-label="getClosure()", id="method:getClosure" }

> Returns an anonymous function that invokes the method on the given object.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                     | Description                                                                                       | Default     |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------- | ----------- |
| `object` | `T`, `null`, `undefined` | An instance of the class to invoke the method on. For static methods, pass `null` or `undefined`. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const fn = method.getClosure(instance);
fn(...args);
```

### `#!ts invoke(object?: T | null, ...args: any[])` { data-toc-label="invoke()", id="method:invoke" }

> Invokes the method on the given object with optional arguments.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name      | Type                     | Description                                                                                       | Default     |
| --------- | ------------------------ | ------------------------------------------------------------------------------------------------- | ----------- |
| `object`  | `T`, `null`, `undefined` | An instance of the class to invoke the method on. For static methods, pass `null` or `undefined`. | `undefined` |
| `...args` | `any[]`                  | Optional arguments to pass to the method.                                                         |             |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
method.invoke(instance);
```
```ts
method.invoke(instance, 'Arguments here!', true);
```
```ts
method.invoke(null, 'Static methods');
```

## Managing parameters

### `#!ts getParameters(filter?: ParameterFilter)` { data-toc-label="getParameters()", id="method:getParameters" }

> Returns an array of [`ReflectionParameter`](parameters.md) instances which describe each parameter from the method.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                          | Description                                                        | Default     |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| `filter` | [`ParameterFilter`](../enums/ParameterFilter.md), `undefined` | An optional filter to choose what kind of parameters are returned. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
// Iterate over all parameters
for (const param of reflect.getParameters()) {}
```
```ts
// Filter parameters that don't have default values
const requiredParams = reflect.getParameters(
	ParameterFilter.WithoutDefault
);
```
```ts
// Multiple filters (AND)
// This will find all parameters with a non-generic type that have metadata
const knownNonPrimitives = reflect.getMethods(
	ParameterFilter.Meta | ParameterFilter.NonPrimitiveType
);
```

### `#!ts getParameter(name: string, filter?: ParameterFilter)` { data-toc-label="getParameter(name, [filter])", id="method:getParameter" }

> Returns a [`ReflectionParameter`](parameters.md) instance for the specified parameter. Returns `undefined` if there
> is no matching parameter.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                          | Description                                                       | Default     |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                      | The name of the parameter to search for.                          | *required*  |
| `filter` | [`ParameterFilter`](../enums/ParameterFilter.md), `undefined` | An optional filter to choose what kind of parameters are checked. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const param = method.getParameter('paramName');
```

### `#!ts getParameter(index: number)` { data-toc-label="getParameter(index)", id="method:getParameter:index" }

> Returns a [`ReflectionParameter`](parameters.md) instance for the parameter at the specified index. Returns
> `undefined` if there is no matching parameter.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                          | Description                                                       | Default     |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| `index`  | `number`                                                      | The index to retrieve (zero-based).                               | *required*  |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const param = method.getParameter(0);
```

### `#!ts hasParameter(name: string, filter?: ParameterFilter)` { data-toc-label="hasParameter()", id="method:hasParameter" }

> Returns `true` if the method contains a parameter with the specified name, optionally with a filter applied.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                          | Description                                                       | Default     |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                      | The name of the parameter to search for.                          | *required*  |
| `filter` | [`ParameterFilter`](../enums/ParameterFilter.md), `undefined` | An optional filter to choose what kind of parameters are checked. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (method.hasParameter('paramName')) {
	// ...
}
```

## Return types

### `#!ts getReturnType()` { id="method:getReturnType" }

> Returns the method's return type as it was defined by the TypeScript compiler. When type information is not
> available, or when the method does not return anything, `undefined` will be returned instead.
>
> - When a function can return multiple types, this will return a generic `Object`
> - When a function returns a class instance, this will return the class constructor
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (method.getReturnType() === String) {
	const str = method.invoke(o);
}
```

### `#!ts getReturnTypeString()` { id="method:getReturnTypeString" }

> Returns the method's return type as a string. This will be identical to what the `typeof` operator would produce.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (method.getReturnTypeString() === 'string') {
	const str = method.invoke(o);
}
```

## Retrieving attributes

This library has a powerful alternative to decorators called [attributes](../decorators/attributes.md). You can use the
following methods to retrieve attribute instances that have been applied to a method.

### `#!ts getAttributes(attribute?: IAttribute<any>)` { data-toc-label="getAttributes()", id="method:getAttributes" }

> Returns an array of instances of the specified attribute on the method. When the `attribute` argument is not
> supplied, it will return all attributes on the method.
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
for (const attribute of method.getAttributes(ExampleAttribute)) {
	// Do something
}
```

### `#!ts getAttribute(attribute: IAttribute<any>)` { data-toc-label="getAttribute()", id="method:getAttribute" }

> Returns an instance of the specified attribute on the method or `undefined` if not found. Only the last instance
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
const latest = method.getAttributes(ExampleAttribute);
```

### `#!ts hasAttribute(attribute: IAttribute<any>)` { data-toc-label="hasAttribute()", id="method:hasAttribute" }

> Returns true if the method has any attributes of the specified type applied.
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
if (method.hasAttribute(ExampleAttribute)) {
	// Do something!
}
```

## Managing metadata

These methods use the `reflect-metadata` library under the hood. You can use the [`@Meta`](../decorators/Meta.md)
decorator built into this package, or refer to the
[TypeScript Handbook on Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), to set metadata on
your methods.

### `#!ts getMetadata(key: any)` { data-toc-label="getMetadata()", id="method:getMetadata" }

> Returns the value of a metadata key on the method.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |

### `getAllMetadata()` { id="method:getAllMetadata" }

> Returns a [`#!ts Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
> containing all metadata on the method.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const meta = reflect.getAllMetadata();
const value = meta.get('key');
```

### `#!ts setMetadata(key: any, value: any)` { data-toc-label="setMetadata()", id="method:setMetadata" }

> Sets the value of a metadata key on the method.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name    | Type  | Description                                                         | Default    |
| ------- | ----- | ------------------------------------------------------------------- | ---------- |
| `key`   | `any` | The key to set data for.                                            | *required* |
| `value` | `any` | The data to store under the key. Existing data will be overwritten. | *required* |

### `#!ts hasMetadata(key: any)` { data-toc-label="hasMetadata()", id="method:hasMetadata" }

> Returns `true` if this method has metadata matching the given key.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |
