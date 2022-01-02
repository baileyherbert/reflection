# Class reflection

## Creating an instance

To get started with reflection, create a `ReflectionClass` instance and pass a reference to a class constructor. You
can also pass an instance of a class and the constructor will be inferred.

```ts
const reflect = new ReflectionClass(ExampleClass);
const reflect = new ReflectionClass(new ExampleClass());
```

## Properties

### `#!ts name: string` { data-toc-label="name", id="property:name" }

> The name of the class as a string.

### `#!ts parent: ReflectionClass?` { data-toc-label="parent", id="property:parent" }

> The reflection instance for the parent class or `undefined` if the class has no parent.

### `#!ts target: Type<T>` { data-toc-label="target", id="property:target" }

> A reference to the underlying class constructor.

### `#!ts prototype: Object` { data-toc-label="prototype", id="property:prototype" }

> A reference to the underlying class prototype.

## Retrieving methods

### `#!ts getMethods(filter?: MethodFilter)` { data-toc-label="getMethods()", id="method:getMethods" }

> Returns an array of [`ReflectionMethod`](methods.md) instances that describe each method on the class.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                    | Description                                                     | Default     |
| -------- | ------------------------------------------------------- | --------------------------------------------------------------- | ----------- |
| `filter` | [`MethodFilter`](../enums/MethodFilter.md), `undefined` | An optional filter to choose what kind of methods are returned. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
// Iterate over all methods
for (const method of reflect.getMethods()) {}
```
```ts
// Filter static methods
const staticMethods = reflect.getMethods(MethodFilter.Static);
```
```ts
// Multiple filters (AND)
const staticOwnMethods = reflect.getMethods(
	MethodFilter.Static | MethodFilter.Own
);
```

### `#!ts getMethod(name: string, filter?: MethodFilter)` { data-toc-label="getMethod()", id="method:getMethod" }

> Returns the [`ReflectionMethod`](methods.md) instance for a method matching the given name. Returns `undefined` when
> no matching method is found.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                    | Description                                                    | Default     |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                | The name of the method to search for.                          | *required*  |
| `filter` | [`MethodFilter`](../enums/MethodFilter.md), `undefined` | An optional filter to choose what kind of methods are checked. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const method = reflect.getMethod('methodName');
method?.invoke(o);
```

### `#!ts hasMethod(name: string, filter?: MethodFilter)` { data-toc-label="hasMethod()", id="method:hasMethod" }

> Returns `true` if the class has a method matching the given name.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                    | Description                                                    | Default     |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                | The name of the method to search for.                          | *required*  |
| `filter` | [`MethodFilter`](../enums/MethodFilter.md), `undefined` | An optional filter to use when checking for a matching method. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
reflect.hasMethod('staticMethodName') // true
reflect.hasMethod('staticMethodName', MethodFilter.Local) // false
```

### `getConstructorMethod()` { id="method:getConstructorMethod" }

> Returns a [`ReflectionMethod`](methods.md) instance representing the `constructor` method for the class. The
> constructor method is guaranteed to exist, even if one is not explicitly defined.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
// These return the same exact object
reflect.getConstructorMethod();
reflect.getMethod('constructor');
```

## Retrieving properties

!!! warning
	Due to the way property metadata is stored, properties will not be visible to reflection unless you use the
	[`@Meta()`](../decorators/Meta.md#variation:smart) or [`@Meta.Property()`](../decorators/Meta.md#variation:property)
	decorators in some way.

	This is because, while property metadata is stored in the same way as methods, there is no way to iterate over
	properties on the prototype like you can with methods. This means there's no way for reflection to identify what
	properties exist.

	To get around this problem, the `@Meta` decorators store a set of known property names on the class under the
	`reflection:properties` key.

### `#!ts getProperties(filter?: PropertyFilter)` { data-toc-label="getProperties()", id="method:getProperties" }

> Returns an array of [`ReflectionProperty`](properties.md) instances that describe each known property on the class.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                        | Description                                                        | Default     |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| `filter` | [`PropertyFilter`](../enums/PropertyFilter.md), `undefined` | An optional filter to choose what kind of properties are returned. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
// Iterate over all properties
for (const property of reflect.getProperties()) {}
```
```ts
// Filter own properties (not from a parent class)
const ownProperties = reflect.getProperties(PropertyFilter.Own);
```

### `#!ts getProperty(name: string, filter?: PropertyFilter)` { data-toc-label="getProperty()", id="method:getProperty" }

> Returns the [`ReflectionProperty`](properties.md) instance for a property matching the given name. Returns `undefined`
> when no matching property is found.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                        | Description                                                       | Default     |
| -------- | ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                    | The name of the property to search for.                           | *required*  |
| `filter` | [`PropertyFilter`](../enums/PropertyFilter.md), `undefined` | An optional filter to choose what kind of properties are checked. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const property = reflect.getProperty('propertyName');
const value = property?.getMetadata('key');
```

### `#!ts hasProperty(name: string, filter?: PropertyFilter)` { data-toc-label="hasProperty()", id="method:hasProperty" }

> Returns `true` if the class has a property matching the given name.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name     | Type                                                        | Description                                                      | Default     |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ----------- |
| `name`   | `string`                                                    | The name of the property to search for.                          | *required*  |
| `filter` | [`PropertyFilter`](../enums/PropertyFilter.md), `undefined` | An optional filter to use when checking for a matching property. | `undefined` |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
reflect.hasProperty('propertyName')
```

## Retrieving attributes

This library has a powerful alternative to decorators called [attributes](../decorators/attributes.md). You can use the
following methods to retrieve attribute instances that have been applied to a class.

### `#!ts getAttributes(attribute?: IAttribute<any>)` { data-toc-label="getAttributes()", id="method:getAttributes" }

> Returns an array of instances of the specified attribute on the class. When the `attribute` argument is not
> supplied, it will return all attributes on the class.
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
for (const attribute of reflect.getAttributes(ExampleAttribute)) {
	// Do something
}
```

### `#!ts getAttribute(attribute: IAttribute<any>)` { data-toc-label="getAttribute()", id="method:getAttribute" }

> Returns an instance of the specified attribute on the class or `undefined` if not found. Only the last instance
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
const latest = reflect.getAttributes(ExampleAttribute);
```

### `#!ts hasAttribute(attribute: IAttribute<any>)` { data-toc-label="hasAttribute()", id="method:hasAttribute" }

> Returns true if the class has any attributes of the specified type applied.
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
if (reflect.hasAttribute(ExampleAttribute)) {
	// Do something!
}
```

## Managing metadata

These methods use the `reflect-metadata` library under the hood. You can use the [`@Meta`](../decorators/Meta.md)
decorator built into this package, or refer to the
[TypeScript Handbook on Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), to set metadata on
your classes.

### `#!ts getMetadata(key: any)` { data-toc-label="getMetadata()", id="method:getMetadata" }

> Returns the value of a metadata key on the class.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |

### `getAllMetadata()` { id="method:getAllMetadata" }

> Returns a [`#!ts Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
> containing all metadata on the class.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
const meta = reflect.getAllMetadata();
const value = meta.get('key');
```

### `#!ts setMetadata(key: any, value: any)` { data-toc-label="setMetadata()", id="method:setMetadata" }

> Sets the value of a metadata key on the class.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name    | Type  | Description                                                         | Default    |
| ------- | ----- | ------------------------------------------------------------------- | ---------- |
| `key`   | `any` | The key to set data for.                                            | *required* |
| `value` | `any` | The data to store under the key. Existing data will be overwritten. | *required* |

### `#!ts hasMetadata(key: any)` { data-toc-label="hasMetadata()", id="method:hasMetadata" }

> Returns `true` if this class has metadata matching the given key.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name  | Type  | Description                                                                                   | Default    |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| `key` | `any` | The key to look for. This must be identical to the key you originally used to store the data. | *required* |

## Ancestry

### `#!ts getHierarchy()` { id="method:getHierarchy" }

> Returns an array of `ReflectionClass` instances representing the hierarchy of the current class. The first element
> in the array will be the topmost parent class, and the last element will be the current class.
>
> For classes with no parents, this will return an array containing only the current class.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
class Vehicle {}
class Car extends Vehicle {}
class Hatchback extends Car {}

const reflection = new ReflectionClass(Hatchback);
const hierarchy = reflection.getHierachy();
```
> The above `hierarchy` variable will be an array that looks like the following.
```ts
[
	ReflectionClass(Vehicle),
	ReflectionClass(Car),
	ReflectionClass(Hatchback)
]
```

### `#!ts hasType(type: Type<any>)` { data-toc-label="hasType()", id="method:hastype" }

> Returns `true` if this class has a class within its hierarchy, including itself, which matches the given class
> constructor type.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name   | Type        | Description                                | Default    |
| ------ | ----------- | ------------------------------------------ | ---------- |
| `type` | `Type<any>` | A reference to the class to check against. | *required* |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
class Vehicle {}
class Car extends Vehicle {}
class Hatchback extends Car {}

const reflection = new ReflectionClass(Hatchback);

reflection.hasType(Car) // true
reflection.hasType(Vehicle) // true
reflection.hasType(Hatchback) // true - includes itself
```

### `#!ts hasAncestorType(type: Type<any>)` { data-toc-label="hasAncestorType()", id="method:hasAncestorType" }

> Returns `true` if this class has a class within its hierarchy, not including itself, which matches the given class
> constructor type.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name   | Type        | Description                                | Default    |
| ------ | ----------- | ------------------------------------------ | ---------- |
| `type` | `Type<any>` | A reference to the class to check against. | *required* |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
class Vehicle {}
class Car extends Vehicle {}
class Hatchback extends Car {}

const reflection = new ReflectionClass(Hatchback);

reflection.hasAncestorType(Car) // true
reflection.hasAncestorType(Vehicle) // true
reflection.hasAncestorType(Hatchback) // false - doesn't include itself
```

## Creating instances

### `#!ts create(args?: any[])` { data-toc-label="create()", id="method:create" }

> Creates a new instance of the class with the given constructor arguments.
>
> <div class="ref-head">**:octicons-package-16: Parameters**</div>
>
| Name   | Type    | Description                        | Default |
| ------ | ------- | ---------------------------------- | ------- |
| `args` | `any[]` | An array of constructor arguments. | `[]`    |
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
class Hatchback {
	public constructor(public name: string, public year: number) {

	}
}

const reflection = new ReflectionClass(Hatchback);
const instance = reflection.create(['Honda Civic', 2020]);
```
