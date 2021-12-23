import { ParameterFilter, ReflectionClass } from '../../src/main';
import { TestAttribute, TestAttributeImpl } from '../artifacts/attributes/TestAttribute';
import { ChildClass } from '../artifacts/ChildClass';

describe('ReflectionMethod', function() {
	const base = new ChildClass();
	const reflect = new ReflectionClass(base);

	const calculateLengthMethod = reflect.getMethod('calculateLength')!;
	const staticMethod = reflect.getMethod('staticMethod')!;
	const nonReflectableMethod = reflect.getMethod('nonReflectableParentMethod')!;
	const overloadedMethod = reflect.getMethod('overloadedMethod')!;

	it('returns the correct name', function() {
		expect(calculateLengthMethod.name).toBe('calculateLength');
		expect(staticMethod.name).toBe('staticMethod');
		expect(nonReflectableMethod.name).toBe('nonReflectableParentMethod');
		expect(overloadedMethod.name).toBe('overloadedMethod');
	});

	it('can invoke methods', function() {
		expect(calculateLengthMethod.invoke(base, 'Hello world')).toBe(11);
		expect(calculateLengthMethod.invoke(base, 'Hello world', 10)).toBe(10);
	});

	it('can create closures', function() {
		const closure = calculateLengthMethod.getClosure(base);

		expect(closure('Hello world')).toBe(11);
		expect(closure('Hello world', 10)).toBe(10);
	});

	it('can identify method types', function() {
		expect(calculateLengthMethod.isStatic).toBe(false);
		expect(calculateLengthMethod.isTyped).toBe(true);

		expect(staticMethod.isStatic).toBe(true);
		expect(staticMethod.isTyped).toBe(true);

		expect(nonReflectableMethod.isStatic).toBe(false);
		expect(nonReflectableMethod.isTyped).toBe(false);
	});

	it('can see return types', function() {
		expect(calculateLengthMethod.getReturnType()).toBe(Number);
		expect(overloadedMethod.getReturnType()).toBe(Number);
		expect(staticMethod.getReturnType()).toBe(undefined);

		expect(calculateLengthMethod.getReturnTypeString()).toBe('number');
		expect(overloadedMethod.getReturnTypeString()).toBe('number');
		expect(staticMethod.getReturnTypeString()).toBe('undefined');
	});

	it('can get parameters', function() {
		const params = calculateLengthMethod.getParameters();

		expect(Array.isArray(params)).toBe(true);
		expect(params.length).toBe(3);
		expect(params[0].name).toBe('input');
		expect(params[1].name).toBe('max');

		expect(calculateLengthMethod.hasParameter('input')).toBe(true);
		expect(calculateLengthMethod.hasParameter('doesNotExist')).toBe(false);

		expect(calculateLengthMethod.getParameter('input')).toBe(params[0]);

		expect(calculateLengthMethod.getParameter(0)?.name).toBe('input');
		expect(calculateLengthMethod.getParameter(1)?.name).toBe('max');
		expect(calculateLengthMethod.getParameter(2)?.name).toBe('unused');
		expect(calculateLengthMethod.getParameter(3)).toBe(undefined);
	});

	it('can filter parameters', function() {
		const [inputParam, maxParam, unusedParam] = calculateLengthMethod.getParameters();

		const withMeta = calculateLengthMethod.getParameters(ParameterFilter.Meta);
		const withDefault = calculateLengthMethod.getParameters(ParameterFilter.WithDefault);
		const withoutDefault = calculateLengthMethod.getParameters(ParameterFilter.WithoutDefault);
		const primitive = calculateLengthMethod.getParameters(ParameterFilter.PrimitiveType);
		const nonPrimitive = calculateLengthMethod.getParameters(ParameterFilter.NonPrimitiveType);
		const known = calculateLengthMethod.getParameters(ParameterFilter.KnownType);
		const unknown = calculateLengthMethod.getParameters(ParameterFilter.UnknownType);

		expect(withMeta).toEqual([ inputParam ]);
		expect(withDefault).toEqual([ maxParam ]);
		expect(withoutDefault).toEqual([ inputParam, unusedParam ]);
		expect(primitive).toEqual([ inputParam, maxParam ]);
		expect(nonPrimitive).toEqual([ unusedParam ]);
		expect(known).toEqual([ inputParam, maxParam ]);
		expect(unknown).toEqual([ unusedParam ]);
	});

	it('caches parameter instances', function() {
		const a = calculateLengthMethod.getParameters();
		const b = calculateLengthMethod.getParameters();

		expect(a[0]).toBe(b[0]);
		expect(a[1]).toBe(b[1]);
	});

	it('can read metadata', function() {
		const test = calculateLengthMethod.getAllMetadata();

		expect(typeof test === 'object').toBe(true);
		expect(test.get('example')).toBe(false);

		expect(calculateLengthMethod.hasMetadata('design:returntype')).toBe(true);
		expect(calculateLengthMethod.hasMetadata('reflection:params')).toBe(true);

		expect(Array.isArray(calculateLengthMethod.getMetadata('reflection:params'))).toBe(true);
	});

	it('can write metadata', function() {
		expect(calculateLengthMethod.hasMetadata('someNumber')).toBe(false);
		calculateLengthMethod.setMetadata('someNumber', 123);
		expect(calculateLengthMethod.hasMetadata('someNumber')).toBe(true);
		expect(calculateLengthMethod.getMetadata('someNumber')).toBe(123);
	});

	it('can retrieve attributes', function() {
		const method = reflect.getMethod('attrMethodTest')!;

		expect(typeof method.getAttribute(TestAttribute)).toBe('object');
		expect(method.getAttribute(TestAttribute)?.constructor).toBe(TestAttributeImpl);
		expect(method.getAttribute(TestAttribute)?.getValue()).toBe(6);
		expect(method.getAttributes(TestAttribute).length).toBe(2);
		expect(method.getAttributes().length).toBe(2);
	});
});
