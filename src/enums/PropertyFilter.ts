export enum PropertyFilter {
	/**
	 * Filter properties that have type metadata available.
	 */
	Typed = 1,

	/**
	 * Filter properties that are inherited from parent classes.
	 */
	Inherited = 2,

	/**
	 * Filter properties that are not inherited from parent classes.
	 */
	Own = 4
}
