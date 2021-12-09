import { ReflectionClass } from '../../src/main';
import { ChildClass } from '../artifacts/ChildClass';
import { ParentClass } from '../artifacts/ParentClass';

describe('ReflectionParameter', function() {
	const base = new ChildClass();
	const reflect = new ReflectionClass(base);

	const method = reflect.getMethod('calculateLength')!;
	const [inputParam, maxParam] = method.getParameters();

	const constructor = reflect.getConstructorMethod();
	const constructorParam = constructor.getParameter('someRandomValue')!;

	it('returns the correct method', function() {
		expect(inputParam.method).toBe(method);
		expect(maxParam.method).toBe(method);
		expect(constructorParam.method).toBe(constructor);
	});

	it('returns the correct names', function() {
		expect(inputParam.name).toBe('input');
		expect(maxParam.name).toBe('max');
		expect(constructorParam.name).toBe('someRandomValue');
	});

	it('returns the correct indexes', function() {
		expect(inputParam.index).toBe(0);
		expect(maxParam.index).toBe(1);
		expect(constructorParam.index).toBe(0);
	});

	it('can determine if parameters have default values', function() {
		expect(inputParam.hasDefault).toBe(false);
		expect(maxParam.hasDefault).toBe(true);
		expect(constructorParam.hasDefault).toBe(true);
	});

	it('can extract the type', function() {
		expect(inputParam.getType()).toBe(String);
		expect(maxParam.getType()).toBe(Number);
		expect(constructorParam.getType()).toBe(String);
	});

	it('can extract the return type as a string', function() {
		expect(inputParam.getTypeString()).toBe('string');
		expect(maxParam.getTypeString()).toBe('number');
		expect(constructorParam.getTypeString()).toBe('string');
	});

	it('can detect class types', function() {
		const method = reflect.getMethod('classTypeTest');
		const methodWithoutDecorator = reflect.getMethod('classTypeNonReflectableTest');

		expect(method?.getParameter('test')?.isClassType).toBe(true);
		expect(method?.getParameter('test')?.getType()).toBe(ParentClass);

		expect(methodWithoutDecorator?.getParameter('test')?.isClassType).toBe(false);
	});

	it('can read metadata', function() {
		expect(inputParam.hasMetadata('test')).toBe(true);
		expect(inputParam.getMetadata('test')).toBe(123);
		expect(constructorParam.getMetadata('test')).toBe(true);
		expect(inputParam.getAllMetadata().get('test')).toBe(123);
	});

	it('can write metadata', function() {
		expect(inputParam.hasMetadata('someNumber')).toBe(false);
		inputParam.setMetadata('someNumber', 456);
		expect(inputParam.hasMetadata('someNumber')).toBe(true);
		expect(inputParam.getMetadata('someNumber')).toBe(456);
	});
});
