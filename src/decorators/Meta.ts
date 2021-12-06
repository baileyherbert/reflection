function ClassMeta(metadataKey: any, metadataValue: any) {
	return function(target: Function) {
		Reflect.metadata(metadataKey, metadataValue)(target);
	};
}

function MethodMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol) {
		Reflect.metadata(metadataKey, metadataValue)(target, propertyKey);
	};
}

function ParameterMeta(metadataKey: any, metadataValue: any) {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
			// Parameter metadata is stored under the method itself
			// For consistency, this library will store parameter metadata under a single `reflection:params` key
			// The value will be an array of maps which contain the key-value pairs

			let parameters = Reflect.getOwnMetadata('reflection:params', target, propertyKey);

			if (parameters === undefined) {
				parameters = new Array<Map<any, any>>();
				Reflect.defineMetadata('reflection:params', parameters, target, propertyKey);
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
	Parameter: typeof ParameterMeta
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
);

interface MetaReturnType {
	(target: Function): void;
	(target: Object, propertyKey: string | symbol): void;
	(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
}
