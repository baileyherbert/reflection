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
	});
});
