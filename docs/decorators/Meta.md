# Meta Decorator

This is a "smart decorator" that can be used to set metadata on classes, methods, and parameters. You can also build
upon this decorator to easily create your own metadata decorators without any of the associated complexity.

## Variations

### `#!ts @Meta(key: any, value: any)` { data-toc-label="@Meta()", id="variation:smart" }

> Returns a metadata decorator that can be applied to classes, methods, and parameters. This is the one you'll want to
> use in practice – the rest are mainly for building upon.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
@Meta('key', 'value')
export class Example {

	@Meta('key', 'value')
	public method(@Meta('key', 'value') param: any) {

	}

}
```

### `#!ts @Meta.Class(key: any, value: any)` { data-toc-label="@Meta.Class()", id="variation:class" }

> Returns a metadata decorator that can be applied to only classes.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
@Meta.Class('key', 'value')
export class Example {

}
```

### `#!ts @Meta.Method(key: any, value: any)` { data-toc-label="@Meta.Method()", id="variation:method" }

> Returns a metadata decorator that can be applied to only methods.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
export class Example {

	@Meta.Method('key', 'value')
	public method() {

	}

}
```

### `#!ts @Meta.Property(key: any, value: any)` { data-toc-label="@Meta.Property()", id="variation:property" }

> Returns a metadata decorator that can be applied to only properties.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
export class Example {

	@Meta.Property('key', 'value')
	public prop: string;

}
```

### `#!ts @Meta.Parameter(key: any, value: any)` { data-toc-label="@Meta.Parameter()", id="variation:parameter" }

> Returns a metadata decorator that can be applied to only parameters.
>
> <div class="ref-head">**:octicons-star-16: Examples**</div>
>
```ts
export class Example {

	public method(@Meta.Parameter('key', 'value') param: any) {

	}

}
```

## Custom decorators

You can create a custom meta decorator using the existing `@Meta` decorators as a basis.

```ts
export const SmartDecorator = Meta('key', 'value');
export const ClassDecorator = Meta.Class('key', 'value');
export const MethodDecorator = Meta.Method('key', 'value');
export const ParameterDecorator = Meta.Parameter('key', 'value');
```

You can also create a decorator that accepts parameters:

```ts
export const VariableDecorator = (value: string) => Meta('key', value);
```

You can then use these constants like normal decorators.

```ts
@SmartDecorator
@ClassDecorator
@VariableDecorator('value')
export class Example {

	@MethodDecorator
	@VariableDecorator('another value')
	public method(@ParameterDecorator param: any) {

	}

}
```
