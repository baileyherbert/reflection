import { Constructor } from '@baileyherbert/types';
import { ReflectionClass } from '../../main';

export interface AttributeClassEvent<T extends Object = Object> {

	/**
	 * The class constructor that the attribute was applied to.
	 */
	constructor: Constructor<T>;

	/**
	 * A reflection instance for the class that the attribute was applied to.
	 */
	reflection: ReflectionClass<T>;

}
