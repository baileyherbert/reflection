/**
 * This is a blank utility decorator that can be applied to a class or method in order to trigger metadata emit.
 */
export function Reflectable(...args: any[]): any {
	if (args.length === 0) {
		return function() {};
	}
}
