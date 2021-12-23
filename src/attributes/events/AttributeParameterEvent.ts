import { ReflectionParameter } from '../../main';

export interface AttributeParameterEvent<T extends Object = Object> {

	/**
	 * The prototype where the parameter is defined.
	 */
	prototype: T;

	/**
	 * The name of the method where the parameter is defined.
	 */
	methodName: string | symbol;

	/**
	 * The index of the parameter in its parent method.
	 */
	parameterIndex: number;

	/**
	 * A reflection instance for the parameter that the attribute was applied to.
	 */
	reflection: ReflectionParameter<T>;

}
