import { ReflectionMethod } from '../../main';

/**
 * @template D The function signature that methods must match.
 */
export interface AttributeMethodEvent<T extends Object = Object, D = any> {

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

	/**
	 * The property descriptor from the decorator.
	 */
	descriptor: TypedPropertyDescriptor<D>;

}
