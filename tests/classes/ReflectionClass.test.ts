import { MethodFilter, ReflectionClass } from '../../src/main';
import { ChildClass } from '../artifacts/ChildClass';
import { ParentClass } from '../artifacts/ParentClass';

describe('ReflectionClass', function() {
	const base = new ChildClass();
	const reflect = new ReflectionClass(base);

	it('matches expected prototype', function() {
		expect(reflect).toBeInstanceOf(ReflectionClass);
		expect(reflect.ref).toBe(ChildClass);
		expect(reflect.name).toBe('ChildClass');
	});

	it('can read metadata', function() {
		expect(reflect.hasMetadata('example')).toBe(true);
		expect(reflect.getMetadata('example')).toBe(true);

		expect(reflect.hasMetadata('doesnt-exist')).toBe(false);
		expect(reflect.getMetadata('doesnt-exist')).toBe(undefined);

		expect(typeof reflect.getAllMetadata()).toBe('object');
		expect(typeof reflect.getAllMetadata().get('example')).toBe('boolean');
		expect(reflect.getAllMetadata().get('example')).toBe(true);
	});

	it('can write metadata', function() {
		expect(reflect.hasMetadata('test-write')).toBe(false);
		expect(reflect.getMetadata('test-write')).toBe(undefined);

		reflect.setMetadata('test-write', 'It works!');

		expect(reflect.hasMetadata('test-write')).toBe(true);
		expect(reflect.getMetadata('test-write')).toBe('It works!');
	});

	it('can compute hierarchy', function() {
		const hierarchy = reflect.getHierarchy();

		expect(hierarchy.length).toBe(2);
		expect(hierarchy).toEqual([
			reflect.parent,
			reflect
		]);
	});

	it('can check ancestry', function() {
		class Foreign {}

		expect(reflect.hasType(ParentClass)).toBe(true);
		expect(reflect.hasType(ChildClass)).toBe(true);
		expect(reflect.hasType(Foreign)).toBe(false);

		expect(reflect.hasAncestorType(ParentClass)).toBe(true);
		expect(reflect.hasAncestorType(ChildClass)).toBe(false);
		expect(reflect.hasAncestorType(Foreign)).toBe(false);
	});

	it('can compare constructor types', function() {
		expect(reflect.isType(ChildClass)).toBe(true);
		expect(reflect.isType(ParentClass)).toBe(false);
	});

	it('can retrieve methods', function() {
		expect(reflect.getMethods().length).toBeGreaterThan(0);

		expect(reflect.hasMethod('overloadedMethod')).toBe(true);
		expect(reflect.hasMethod('calculateLength')).toBe(true);
		expect(reflect.hasMethod('doesNotExist')).toBe(false);

		expect(reflect.hasMethod('constructor')).toBe(true);
	});

	it('can filter methods', function() {
		const staticMethods = reflect.getMethods(MethodFilter.Static).map(method => method.name);
		expect(staticMethods).toContain('staticMethod');
		expect(staticMethods).toContain('parentStaticMethod');
		expect(staticMethods).not.toContain('calculateLength');

		const localMethods = reflect.getMethods(MethodFilter.Local).map(method => method.name);
		expect(localMethods).toContain('calculateLength');
		expect(localMethods).toContain('parentMethod');
		expect(localMethods).not.toContain('staticMethod');
		expect(localMethods).not.toContain('parentStaticMethod');

		const ownMethods = reflect.getMethods(MethodFilter.Own).map(method => method.name);
		expect(ownMethods).toContain('overloadedMethod');
		expect(ownMethods).toContain('calculateLength');
		expect(ownMethods).not.toContain('parentMethod');

		const inheritedMethods = reflect.getMethods(MethodFilter.Inherited).map(method => method.name);
		expect(inheritedMethods).toContain('parentMethod');
		expect(inheritedMethods).not.toContain('overloadedMethod');
		expect(inheritedMethods).not.toContain('calculateLength');

		const typedMethods = reflect.getMethods(MethodFilter.Typed).map(method => method.name);
		expect(typedMethods).toContain('calculateLength');
		expect(typedMethods).toContain('parentMethod');
		expect(typedMethods).toContain('overloadedMethod');
		expect(typedMethods).not.toContain('parentStaticMethod');
		expect(typedMethods).not.toContain('nonReflectableParentMethod');
	});

	it('can see constructors', function() {
		const method = reflect.getMethod('constructor')!;
		const params = method.getParameters();

		expect(params.length).toBe(1);
		expect(params[0].name).toBe('someRandomValue');
		expect(params[0].getTypeString()).toBe('string');
		expect(reflect.getConstructorMethod()).toBe(method);
	});

	it('can create instances', function() {
		expect(reflect.create(['Test'])).toBeInstanceOf(ChildClass);
		expect(reflect.create(['Test']).someRandomValue).toBe('Test');
		expect(reflect.create().someRandomValue).toBe('Not provided');

		expect(reflect.parent?.create()).toBeInstanceOf(ParentClass);
	});
});
