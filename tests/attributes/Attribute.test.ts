import { Attribute, AttributeClassEvent, AttributeMethodEvent, AttributeParameterEvent, AttributePropertyEvent, attributes, ATTR_OPTIONS } from '../../src/main';

ATTR_OPTIONS.emitInvalidUsageErrors = false;

describe('Attribute', function() {
	describe('Decorator type checking', function() {
		it('Can be both invoked and constructed', function() {
			class ExampleAttr extends Attribute { override onClass(event: AttributeClassEvent<Object>) {} }
			const Attr = Attribute.create(ExampleAttr);

			expect(new Attr()).toBeInstanceOf(ExampleAttr);
			expect(typeof Attr()).toBe('function');
		});

		it('Disallows usage when no handlers are defined', function() {
			const Attr = Attribute.create(class extends Attribute {});

			// @ts-expect-error
			@Attr() class Test {
				// @ts-expect-error
				@Attr() public prop?: string;
				// @ts-expect-error
				@Attr() public method() {}
				// @ts-expect-error
				public propMethod(@Attr() prop: string) {}
			}
		});

		it('Allows class usage', function() {
			const Attr = Attribute.create(class extends Attribute {
				public override onClass(event: AttributeClassEvent<Object>) {}
			});

			@Attr() class Test {
				// @ts-expect-error
				@Attr() public prop?: string;
				// @ts-expect-error
				@Attr() public method() {}
				// @ts-expect-error
				public propMethod(@Attr() prop: string) {}
			}
		});

		it('Allows method usage', function() {
			const Attr = Attribute.create(class extends Attribute {
				public override onMethod(event: AttributeMethodEvent<Object>) {}
			});

			// @ts-expect-error
			@Attr() class Test {
				// @ts-expect-error
				@Attr() public prop?: string;
				@Attr() public method() {}
				// @ts-expect-error
				public propMethod(@Attr() prop: string) {}
			}
		});

		it('Allows property usage', function() {
			const Attr = Attribute.create(class extends Attribute {
				public override onProperty(event: AttributePropertyEvent<Object>) {}
			});

			// @ts-expect-error
			@Attr() class Test {
				@Attr() public prop?: string;
				// @ts-expect-error
				@Attr() public method() {}
				// @ts-expect-error
				public propMethod(@Attr() prop: string) {}
			}
		});

		it('Allows parameter usage', function() {
			const Attr = Attribute.create(class extends Attribute {
				public override onParameter(event: AttributeParameterEvent<Object>) {}
			});

			// @ts-expect-error
			@Attr() class Test {
				// @ts-expect-error
				@Attr() public prop?: string;
				// @ts-expect-error
				@Attr() public method() {}
				public propMethod(@Attr() prop: string) {}
			}
		});

		it('Accepts constructor arguments', function() {
			const Attr = Attribute.create(class extends Attribute {
				public constructor(public value: number) { super(); }
				public override onClass(event: AttributeClassEvent<Object>) {}
			});

			@Attr(1)
			@Attr(5)
			class Test {}

			expect(attributes.getFromClass(Test, Attr).shift()?.value).toBe(5);
		});

		it('Can work without parenthesis when there are no constructor arguments', function() {
			class AttrImpl extends Attribute {
				public override onClass(event: AttributeClassEvent<Object>) {}
				public override onMethod(event: AttributeMethodEvent<Object, any>) {}
				public override onParameter(event: AttributeParameterEvent<Object>) {}
				public override onProperty(event: AttributePropertyEvent<Object>) {}
			}

			const Attr = Attribute.create(AttrImpl);

			@Attr
			class Test {
				@Attr
				public prop = 5;

				@Attr
				public method(@Attr param: string) {

				}
			}

			expect(attributes.getFromClass(Test).map(t => t.constructor)).toEqual([AttrImpl]);
			expect(attributes.getFromMethod(Test.prototype, 'method').map(t => t.constructor)).toEqual([AttrImpl]);
			expect(attributes.getFromProperty(Test.prototype, 'prop').map(t => t.constructor)).toEqual([AttrImpl]);
			expect(attributes.getFromParameter(Test.prototype, 'method', 0).map(t => t.constructor)).toEqual([AttrImpl]);
		});

		it('Fire events', function() {
			class AttrImpl extends Attribute {
				public override onClass(event: AttributeClassEvent<Object>) {}
				public override onMethod(event: AttributeMethodEvent<Object, any>) {}
				public override onParameter(event: AttributeParameterEvent<Object>) {}
				public override onProperty(event: AttributePropertyEvent<Object>) {}
			}

			const Attr = Attribute.create(AttrImpl);
			const totalCounter = jest.fn();
			const methodCounter = jest.fn();
			const types = new Array<string>();

			Attr.events.on('attached', (attribute, type) => {
				totalCounter();
				types.push(type);
			});

			Attr.events.on('classAttached', (constructor, attribute) => {
				methodCounter();

				expect(constructor).toBe(Test);
				expect(attribute).toBeInstanceOf(AttrImpl);
			});

			Attr.events.on('methodAttached', (prototype, methodName, descriptor, attribute) => {
				methodCounter();

				expect(prototype).toBe(Test.prototype);
				expect(methodName).toBe('method');
				expect(typeof descriptor).toBe('object');
				expect(attribute).toBeInstanceOf(AttrImpl);
			});

			Attr.events.on('propertyAttached', (prototype, propName, attribute) => {
				methodCounter();

				expect(prototype).toBe(Test.prototype);
				expect(propName).toBe('prop');
				expect(attribute).toBeInstanceOf(AttrImpl);
			});

			Attr.events.on('parameterAttached', (prototype, methodName, parameterIndex, attribute) => {
				methodCounter();

				expect(prototype).toBe(Test.prototype);
				expect(methodName).toBe('method');
				expect(parameterIndex).toBe(0);
				expect(attribute).toBeInstanceOf(AttrImpl);
			});

			@Attr
			class Test {
				@Attr
				public prop = true;

				@Attr
				public method(@Attr param: string) {}
			}

			expect(totalCounter).toHaveBeenCalledTimes(4);
			expect(methodCounter).toHaveBeenCalledTimes(4);

			expect(types).toContain('property');
			expect(types).toContain('parameter');
			expect(types).toContain('method');
			expect(types).toContain('class');
		});
	});
});
