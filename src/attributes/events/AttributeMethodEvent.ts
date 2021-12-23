import { ReflectionMethod } from '../../main';

export interface AttributeMethodEvent<T extends Object = Object> {

	/**
	 * The prototype where the method is defined.
	 */
	prototype: T;

	/**
	 * The name of the method that the attribute was applied to.
	 */
	methodName: string | symbol;

	/**
	 * A reflection instance for the method that the attribute was applied to.
	 */
	reflection: ReflectionMethod<T>;

}
