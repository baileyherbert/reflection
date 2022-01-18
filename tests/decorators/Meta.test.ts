import { Meta, ReflectionClass } from '../../src/main';

describe('Meta', function() {
	it('Applies to all types', function() {
		@Meta('a', true)
		class Test {
			@Meta('b', true)
			public prop = 'Property';

			public constructor(@Meta('c', true) param: string) {}

			@Meta('d', true)
			public method(@Meta('e', true) param: string) {

			}
		}

		const classRef = new ReflectionClass(Test);
		const constructorRef = classRef.getConstructorMethod();
		const methodRef = classRef.getMethod('method')!;
		const propRef = classRef.getProperty('prop')!;

		expect(classRef.getMetadata('a')).toBe(true);
		expect(propRef.getMetadata('b')).toBe(true);
		expect(constructorRef.getParameter(0)!.getMetadata('c')).toBe(true);
		expect(methodRef.getMetadata('d')).toBe(true);
		expect(methodRef.getParameter(0)!.getMetadata('e')).toBe(true);
	});
});
