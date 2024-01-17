function ClassMeta(metadataKey: any, metadataValue: any) {
	return function(target: Function) {
		Reflect.metadata(metadataKey, metadataValue)(target);
	};
}

function MethodMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol) {
		if (propertyKey in target) {
			Reflect.metadata(metadataKey, metadataValue)(target, propertyKey);
		}
		else {
			throw new Error(
				`Could not set method metadata on ${target.constructor.name}.${propertyKey.toString()}: ` +
				`no such method exists on the prototype`
			);
		}
	};
}

function PropertyMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol) {
		// Make sure this is actually a propert
		if (propertyKey in target) {
			throw new Error(
				`Could not set property metadata on ${target.constructor.name}.${propertyKey.toString()}: ` +
				`property '${propertyKey.toString()}' is a method`
			);
		}

		Reflect.metadata(metadataKey, metadataValue)(target, propertyKey);

		// Property metadata is stored in the same manner as methods
		// We can find all methods by looking at the prototype, but that won't work for properties
		// So we'll need to maintain metadata on the class for known property names

		const properties = Reflect.getOwnMetadata('reflection:properties', target.constructor) ?? new Set();

		if (!properties.has(propertyKey)) {
			properties.add(propertyKey);

			if (properties.size === 1) {
				Reflect.metadata('reflection:properties', properties)(target.constructor);
			}
		}
	};
}

function ParameterMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
			// Parameter metadata is stored under the method itself
			// For consistency, this library will store parameter metadata under a single `reflection:params` key
			// The value will be an array of maps which contain the key-value pairs

			let parameters = Reflect.getOwnMetadata('reflection:params', target, propertyKey as any);

			if (parameters === undefined) {
				parameters = new Array<Map<any, any>>();
				Reflect.defineMetadata('reflection:params', parameters, target, propertyKey as any);
			}

			if (!(parameterIndex in parameters)) {
				parameters[parameterIndex] = new Map();
			}

			parameters[parameterIndex].set(metadataKey, metadataValue);
	};
}

let AutoMeta = function(metadataKey: any, metadataValue: any): MetaReturnType {
	return function(target: Object, propertyKey?: string | symbol, parameterIndex?: number) {
		if (typeof parameterIndex === 'number') {
			ParameterMeta(metadataKey, metadataValue)(target, propertyKey!, parameterIndex);
		}
		else if (propertyKey === undefined) {
			ClassMeta(metadataKey, metadataValue)(target as Function);
		}
		else if (!(propertyKey in target)) {
			PropertyMeta(metadataKey, metadataValue)(target, propertyKey);
		}
		else {
			MethodMeta(metadataKey, metadataValue)(target, propertyKey);
		}
	}
};

interface MetaDecorator {
	/**
	 * A smart metadata decorator that can set metadata on classes, methods, and parameters.
	 *
	 * @param metadataKey The key to set
	 * @param metadataValue The value to set
	 */
	(metadataKey: any, metadataValue: any): MetaReturnType;

	/**
	 * A metadata decorator that can only be applied to classes.
	 *
	 * @param metadataKey The key to set
	 * @param metadataValue The value to set
	 */
	Class: typeof ClassMeta,

	/**
	 * A metadata decorator that can only be applied to methods.
	 *
	 * @param metadataKey The key to set
	 * @param metadataValue The value to set
	 */
	Method: typeof MethodMeta,

	/**
	 * A metadata decorator that can only be applied to parameters.
	 *
	 * @param metadataKey The key to set
	 * @param metadataValue The value to set
	 */
	Parameter: typeof ParameterMeta,

	/**
	 * A metadata decorator that can only be applied to properties.
	 */
	Property: typeof PropertyMeta
}

/**
 * A smart metadata decorator that can set metadata on classes, methods, and parameters.
 *
 * - `Meta()` – Works anywhere
 * - `Meta.Class()` – Classes only
 * - `Meta.Method()` – Methods only
 * - `Meta.Parameter()` – Parameters only
 *
 * @param metadataKey The key to set
 * @param metadataValue The value to set
 */
export const Meta: MetaDecorator = Object.assign(
	AutoMeta,
	{ Class: ClassMeta },
	{ Method: MethodMeta },
	{ Parameter: ParameterMeta },
	{ Property: PropertyMeta }
);

interface MetaReturnType {
	(target: Function): void;
	(target: Object, propertyKey: string | symbol | undefined): void;
	(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void;
}
