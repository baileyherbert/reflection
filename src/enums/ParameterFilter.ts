export enum ParameterFilter {
	/**
	 * Filter parameters that have any kind of metadata.
	 */
	None = 0,

	/**
	 * Filter parameters that have reflection metadata.
	 *
	 * Note that the metadata must be set using this library's `@Meta` or `@Meta.Parameter` decorator, or using a
	 * custom decorator that was built on top of them. Otherwise, the metadata will not be detected.
	 */
	Meta = 1,

	/**
	 * Filter parameters that have ES6 default values.
	 */
	WithDefault = 2,

	/**
	 * Filter parameters that do not have ES6 default values.
	 */
	WithoutDefault = 4,

	/**
	 * Filter parameters that have primitive types.
	 */
	PrimitiveType = 8,

	/**
	 * Filter parameters that have specific object or function types.
	 */
	NonPrimitiveType = 16,

	/**
	 * Filter parameters that have known specific types.
	 *
	 * This will exclude types like `any`, `never`, and `unknown`, as well as any generic objects that can't be
	 * described with a specific prototype or constructor.
	 */
	KnownType = 32,

	/**
	 * Filter parameters that have unknown types.
	 *
	 * This will only include types like `any`, `never`, and `unknown`, as well as generic objects that can't be
	 * described with a specific prototype or constructor.
	 */
	UnknownType = 64
}
