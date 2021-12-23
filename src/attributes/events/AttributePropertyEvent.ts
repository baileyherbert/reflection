import { ReflectionProperty } from '../../main';

export interface AttributePropertyEvent<T extends Object = Object> {

	/**
	 * The prototype where the method is defined.
	 */
	prototype: T;

	/**
	 * The name of the property that the attribute was applied to.
	 */
	propertyName: string | symbol;

	/**
	 * A reflection instance for the property that the attribute was applied to.
	 */
	reflection: ReflectionProperty<T>;

}
