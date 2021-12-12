import { Meta, Reflectable } from '../../src/main';
import { ParentClass } from './ParentClass';

@Reflectable
@Meta('example', true)
export class ChildClass extends ParentClass {

	@Meta('test', 'propA')
	public propA: number;

	@Meta.Property('another_test', 'propB')
	public propB: boolean;

	public constructor(@Meta('test', true) public someRandomValue: string = 'Not provided') {
		super();

		this.propA = 1;
		this.propB = true;
	}

	public override overloadedMethod() {
		return 5;
	}

	/**
	 * Returns the length of the given input up to the maximum length. If the maximum length is 0, the length of the
	 * input is returned unfiltered.
	 *
	 * @param input
	 * @param max
	 * @returns
	 */
	@Reflectable
	@Meta('example', false)
	public calculateLength(@Meta('test', 123) input: string, max: number = 0, unused?: any): number {
		return Math.min(input.length, max > 0 ? max : Infinity);
	}

	@Reflectable
	public static staticMethod() {

	}

	@Reflectable
	public classTypeTest(test: ParentClass) {

	}

	public classTypeNonReflectableTest(test: ParentClass) {

	}

}
