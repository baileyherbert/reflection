import * as Main from '../src/main';

describe('main', function() {
	it('exports required objects', function() {
		expect(typeof Main.Reflectable).toBe('function');
		expect(typeof Main.ReflectionClass).toBe('function');
		expect(typeof Main.ReflectionMethod).toBe('function');
		expect(typeof Main.MethodFilter).toBe('object');
		expect(typeof Main.ParameterFilter).toBe('object');
	})

	it('exports the meta decorator', function() {
		expect(typeof Main.Meta).toBe('function');

		expect(typeof Main.Meta.Class).toBe('function');
		expect(typeof Main.Meta.Method).toBe('function');
		expect(typeof Main.Meta.Parameter).toBe('function');
	});
});
