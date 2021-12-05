# Reflectable Decorator

Type reflection depends on type metadata being emitted by the TypeScript compiler. However, the compiler does not
emit type metadata unless there is a decorator applied.

In cases when you need to reflect on a class or method, and there are no decorators applied to it (or a parent
implementation of it), then you can use the `#!ts @Reflectable` decorator.

## `#!ts @Reflectable()`

A blank decorator that can be used to trigger metadata emit by `tsc` on a class or method. The parenthesis on this
decorator are optional.

```ts
import { Reflectable } from '@baileyherbert/reflection';

@Reflectable
export class Example {

	@Reflectable
	public method() {

	}

}
```
