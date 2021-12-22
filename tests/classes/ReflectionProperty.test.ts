import { ReflectionClass } from '../../src/main';
import { ChildClass } from '../artifacts/ChildClass';

describe('ReflectionProperty', function() {
	const base = new ChildClass();
	const reflect = new ReflectionClass(base);

	const propA = reflect.getProperty('propA')!;
	const propB = reflect.getProperty('propB')!;
	const propC = reflect.getProperty('propC')!;

	it('can see types', function() {
		expect(propA.getType()).toBe(Number);
		expect(propA.getTypeString()).toBe('number');

		expect(propB.getType()).toBe(Boolean);
		expect(propB.getTypeString()).toBe('boolean');

		expect(propC.getType()).toBe(String);
		expect(propC.getTypeString()).toBe('string');
	});

	it('can read metadata', function() {
		expect(propA.hasMetadata('test')).toBe(true);
		expect(propA.getMetadata('test')).toBe('propA');

		expect(propB.hasMetadata('another_test')).toBe(true);
		expect(propB.getMetadata('another_test')).toBe('propB');

		expect(propC.hasMetadata('parent_test')).toBe(true);
		expect(propC.getMetadata('parent_test')).toBe('propC');

		expect(propA.getAllMetadata().has('test')).toBe(true);
	});

	it('can write metadata', function() {
		expect(propA.hasMetadata('written')).toBe(false);
		propA.setMetadata('written', true);
		expect(propA.hasMetadata('written')).toBe(true);
		expect(propA.getMetadata('written')).toBe(true);
	});
});