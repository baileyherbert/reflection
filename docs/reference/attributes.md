# Attributes

## Introduction

Attributes are a new decorator concept exclusive to this library. Rather than define a decorator function which is
simply invoked after the class is declared, attributes are entire classes that can be applied to your target classes,
methods, properties, and parameters.

Using reflection at runtime, you can retrieve instances of all attributes applied to classes and their members. You can
then use their methods and access their data.

Even if you don't need to retrieve instances at runtime, attributes can be a quick and simple way to create a metadata
decorator that works on specific or all member types.

## Example

### Creating an attribute

The following code creates an `@Example()` attribute which can only be applied to classes. It sets metadata on the
target class using a value passed into the constructor.

```ts
import { Attribute, AttributeClassEvent } from '@baileyherbert/reflection';

export const Example = Attribute.create(class extends Attribute {

	public constructor(public message: string) {
		super();
	}

	public override onClass(event: AttributeClassEvent<Object>) {
		event.reflection.setMetadata('attr_message', this.message);
	}

});
```

### Using an attribute

The attribute can then be used like any other decorator.

```ts
@Example('Hello world!')
export class MessageContainer {}
```

### Retrieving an attribute

You can also use reflection to retrieve the attribute and access its `message` property. You can access all public
properties and methods on the attribute's underlying class.

```ts
const reflection = new ReflectionClass(MessageContainer);
const example = reflection.getAttribute(Example)!;

console.log(example.message) // 'Hello world!'
```

## Attribute classes

Attributes contain four methods which are invoked just like decorator functions would be. These methods are special,
however. Unless you override them, the attribute won't be applicable to those target types.

Review the following example which shows all four method signatures. In this case, the attribute can be applied to all
four target types.

```ts
const Example = Attribute.create(class extends Attribute {

	public override onClass(event: AttributeClassEvent<Object>) {

	}

	public override onMethod(event: AttributeMethodEvent<Object>) {

	}

	public override onParameter(event: AttributeParameterEvent<Object>) {

	}

	public override onProperty(event: AttributePropertyEvent<Object>) {

	}

});
```

Each of the `event` objects passed into these methods contains the decorator parameters, as well as a reflection
instance which you can use to analyze and set metadata on the target.

## Restricting types

You can use the generic in `Attribute<T>` to restrict what kinds of classes the attribute can be applied to. The
attribute event objects will also need to have their generics updated.

```ts
const Example = Attribute.create(class extends Attribute<SampleClass> {

	public override onClass(event: AttributeClassEvent<SampleClass>) {

	}

	public override onMethod(event: AttributeMethodEvent<SampleClass>) {

	}

}
```

Now the attribute can only be applied to `SampleClass` or its children.

```ts
@Example() // OK
class SampleClass {}

@Example() // ERROR!
class AnotherClass {}
```

## Registry

This library exports an `attributes` registry where all attribute instances are registered across the application. You
typically will want to use the `getAttribute()` and `getAttributes()` methods on reflection objects, but you _could_
use this instead.

```ts
import { attributes } from '@baileyherbert/reflection';

@Example()
class SampleClass {}

// Get the 'Example' attribute instance above
const attr = attributes.getFromClass(SampleClass, Example)[0];
```
