export enum MethodFilter {
	/**
	 * Filter methods that are static.
	 */
	Static = 1,

	/**
	 * Filter methods that are local (not static).
	 */
	Local = 2,

	/**
	 * Filter methods that have type metadata available.
	 */
	Typed = 4,

	/**
	 * Filter methods that are inherited from parent classes.
	 */
	Inherited = 8,

	/**
	 * Filter methods that are not inherited from parent classes.
	 */
	Own = 16
}
