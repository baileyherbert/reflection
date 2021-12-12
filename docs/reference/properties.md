# Property reflection

## Retrieving an instance

Retrieve an instance from the parent class using [`getProperty()`](classes.md#method:getProperty) or
[`getProperties()`](classes.md#method:getProperties). It is not possible to manually instantiate a reflection property.

## Properties

### `#!ts name: string` { data-toc-label="name", id="property:name" }

> The name of the property as a string.

### `#!ts class: ReflectionClass` { data-toc-label="class", id="property:class" }

> The class that this property belongs to.

### `#!ts isTyped: boolean` { data-toc-label="isTyped", id="property:isTyped" }

> Whether or not the property has type metadata available from TypeScript.

## Property type

### `#!ts getType()` { id="method:getType" }

> Returns the property's expected type as it was defined by the TypeScript compiler. When type information is not
> available, or when the property does not define a type, `undefined` will be returned instead.
>
> - When a property accepts multiple types, this will return a generic `Object`
> - When a property accepts a class instance, this will return the class constructor
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (property.getType() === String) {}
if (property.getType() === undefined) {}
```

### `#!ts getTypeString()` { id="method:getTypeString" }

> Returns the property's expected type as a string. This will be identical to what the `typeof` operator would
> produce.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
if (property.getTypeString() === 'string') {}
if (property.getTypeString() === 'undefined') {}
```

## Managing metadata

These methods use the `reflect-metadata` library under the hood. You can use the [`@Meta`](../decorators/Meta.md)
decorator built into this package, or refer to the
[TypeScript Handbook on Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), to set metadata on
your properties.

### `#!ts getMetadata(key: any)` { data-toc-label="getMetadata()", id="method:getMetadata" }

> Returns the value of a metadata key on the property.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |

### `getAllMetadata()` { id="method:getAllMetadata" }

> Returns a [`#!ts Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
> containing all metadata on the property.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const meta = reflect.getAllMetadata();
const value = meta.get('key');
```

### `#!ts setMetadata(key: any, value: any)` { data-toc-label="setMetadata()", id="method:setMetadata" }

> Sets the value of a metadata key on the property.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name    | Type  | Description                                                         | Default    |
| ------- | ----- | ------------------------------------------------------------------- | ---------- |
| `key`   | `any` | The key to set data for.                                            | *required* |
| `value` | `any` | The data to store under the key. Existing data will be overwritten. | *required* |

### `#!ts hasMetadata(key: any)` { data-toc-label="hasMetadata()", id="method:hasMetadata" }

> Returns `true` if this property has metadata matching the given key.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |
