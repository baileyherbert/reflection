import { Type } from '@baileyherbert/types';
import { Attribute, IAttribute, IAttributeConstructor, IAttributeInstance } from './Attribute';

class AttributeRegistry {

	protected attributes = new Map<IAttributeConstructor, Set<[Attribute<any>, ITarget]>>();
	protected classes = new Map<Type<any>, Set<Attribute<any>>>();
	protected methods = new Map<Object, Map<string, Set<Attribute<any>>>>();
	protected parameters = new Map<Object, Map<string, Map<number, Set<Attribute<any>>>>>();
	protected properties = new Map<Object, Map<string, Set<Attribute<any>>>>();

	/**
	 * Registers a class attribute.
	 *
	 * @param constructor
	 * @param attribute
	 * @internal
	 */
	public _registerClassAttribute(constructor: Type<any>, attribute: Attribute<any>) {
		if (!this.classes.has(constructor)) {
			this.classes.set(constructor, new Set());
		}

		this.classes.get(constructor)!.add(attribute);

		if (!this.attributes.has(attribute.constructor)) {
			this.attributes.set(attribute.constructor, new Set());
		}

		this.attributes.get(attribute.constructor)!.add([attribute, {
			type: 'class',
			constructor
		}]);
	}

	/**
	 * Registers a method attribute.
	 *
	 * @param prototype
	 * @param methodName
	 * @param attribute
	 * @internal
	 */
	public _registerMethodAttribute(prototype: Object, methodName: string, attribute: Attribute<any>) {
		if (!this.methods.has(prototype)) {
			this.methods.set(prototype, new Map());
		}

		if (!this.methods.get(prototype)!.has(methodName)) {
			this.methods.get(prototype)!.set(methodName, new Set());
		}

		this.methods.get(prototype)!.get(methodName)!.add(attribute);

		if (!this.attributes.has(attribute.constructor)) {
			this.attributes.set(attribute.constructor, new Set());
		}

		this.attributes.get(attribute.constructor)!.add([attribute, {
			type: 'method',
			prototype,
			methodName
		}]);
	}

	/**
	 * Registers a property attribute.
	 *
	 * @param prototype
	 * @param propertyName
	 * @param attribute
	 * @internal
	 */
	public _registerPropertyAttribute(prototype: Object, propertyName: string, attribute: Attribute<any>) {
		if (!this.properties.has(prototype)) {
			this.properties.set(prototype, new Map());
		}

		if (!this.properties.get(prototype)!.has(propertyName)) {
			this.properties.get(prototype)!.set(propertyName, new Set());
		}

		this.properties.get(prototype)!.get(propertyName)!.add(attribute);

		if (!this.attributes.has(attribute.constructor)) {
			this.attributes.set(attribute.constructor, new Set());
		}

		this.attributes.get(attribute.constructor)!.add([attribute, {
			type: 'property',
			prototype,
			propertyName
		}]);
	}

	/**
	 * Registers a parameter attribute.
	 *
	 * @param prototype
	 * @param methodName
	 * @param parameterIndex
	 * @param attribute
	 * @internal
	 */
	public _registerParameterAttribute(prototype: Object, methodName: string, parameterIndex: number, attribute: Attribute<any>) {
		if (!this.parameters.has(prototype)) {
			this.parameters.set(prototype, new Map());
		}

		if (!this.parameters.get(prototype)!.has(methodName)) {
			this.parameters.get(prototype)!.set(methodName, new Map());
		}

		if (!this.parameters.get(prototype)!.get(methodName)!.has(parameterIndex)) {
			this.parameters.get(prototype)!.get(methodName)!.set(parameterIndex, new Set());
		}

		this.parameters.get(prototype)!.get(methodName)!.get(parameterIndex)!.add(attribute);

		if (!this.attributes.has(attribute.constructor)) {
			this.attributes.set(attribute.constructor, new Set());
		}

		this.attributes.get(attribute.constructor)!.add([attribute, {
			type: 'parameter',
			prototype,
			methodName,
			parameterIndex
		}]);
	}

	/**
	 * Returns all attributes on the given constructor.
	 *
	 * @param constructor
	 */
	public getFromClass(constructor: Type<any>): IAttributeInstance<IAttribute<any>>[];

	/**
	 * Returns all attributes of the specified type on the given constructor.
	 *
	 * @param constructor
	 * @param attribute
	 */
	public getFromClass<T extends IAttribute<any>>(constructor: Type<any>, attribute: T): IAttributeInstance<T>[];
	public getFromClass(constructor: Type<any>, attribute?: IAttribute<any>): IAttributeInstance<any>[] {
		let attributes = [...(this.classes.get(constructor) ?? [])];

		if (typeof attribute !== 'undefined') {
			attributes = attributes.filter(attr => {
				return (attr.constructor === attribute._constructor);
			});
		}

		return attributes;
	}

	/**
	 * Returns true if the given class has an attribute of the specified type.
	 *
	 * @param constructor
	 * @param attribute
	 */
	public hasFromClass(constructor: Type<any>, attribute: IAttribute<any>) {
		const attributes = this.classes.get(constructor);

		if (attributes) {
			for (const attr of attributes) {
				if (attr.constructor === attribute._constructor) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Returns all attributes on the given method.
	 *
	 * @param prototype
	 * @param methodName
	 */
	public getFromMethod(prototype: Object, methodName: string): IAttributeInstance<IAttribute<any>>[];

	/**
	 * Returns all attributes of the specified type on the given method.
	 *
	 * @param prototype
	 * @param methodName
	 * @param attribute
	 */
	public getFromMethod<T extends IAttribute<any>>(prototype: Object, methodName: string, attribute: T): IAttributeInstance<T>[];
	public getFromMethod(prototype: Object, methodName: string, attribute?: IAttribute<any>): IAttributeInstance<IAttribute<any>>[] {
		let attributes = [...(this.methods.get(prototype)?.get(methodName) ?? [])];

		if (typeof attribute !== 'undefined') {
			attributes = attributes.filter(attr => {
				return (attr.constructor === attribute._constructor);
			});
		}

		return attributes;
	}

	/**
	 * Returns true if the given method has an attribute of the specified type.
	 *
	 * @param prototype
	 * @param methodName
	 * @param attribute
	 */
	public hasFromMethod(prototype: Object, methodName: string, attribute: IAttribute<any>) {
		const attributes = this.methods.get(prototype)?.get(methodName);

		if (attributes) {
			for (const attr of attributes) {
				if (attr.constructor === attribute._constructor) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Returns all attributes on the given parameter.
	 *
	 * @param prototype
	 * @param methodName
	 * @param parameterIndex
	 */
	public getFromParameter(prototype: Object, methodName: string, parameterIndex: number): IAttributeInstance<IAttribute<any>>[];

	 /**
	  * Returns all attributes of the specified type on the given parameter.
	  *
	  * @param prototype
	  * @param methodName
	  * @param parameterIndex
	  * @param attribute
	  */
	public getFromParameter<T extends IAttribute<any>>(prototype: Object, methodName: string, parameterIndex: number, attribute: T): IAttributeInstance<T>[];
	public getFromParameter(prototype: Object, methodName: string, parameterIndex: number, attribute?: IAttribute<any>): IAttributeInstance<IAttribute<any>>[] {
		let attributes = [...(this.parameters.get(prototype)?.get(methodName)?.get(parameterIndex) ?? [])];

		if (typeof attribute !== 'undefined') {
			attributes = attributes.filter(attr => {
				return (attr.constructor === attribute._constructor);
			});
		}

		return attributes;
	}

	/**
	 * Returns true if the given parameter has an attribute of the specified type.
	 *
	 * @param prototype
	 * @param methodName
	 * @param parameterIndex
	 * @param attribute
	 */
	public hasFromParameter(prototype: Object, methodName: string, parameterIndex: number, attribute: IAttribute<any>) {
		const attributes = this.parameters.get(prototype)?.get(methodName)?.get(parameterIndex);

		if (attributes) {
			for (const attr of attributes) {
				if (attr.constructor === attribute._constructor) {
					return true;
				}
			}
		}

		return false;
	}


	/**
	 * Returns all attributes on the given property.
	 *
	 * @param prototype
	 * @param propertyName
	 */
	public getFromProperty(prototype: Object, propertyName: string): IAttributeInstance<IAttribute<any>>[];

	 /**
	  * Returns all attributes of the specified type on the given property.
	  *
	  * @param prototype
	  * @param propertyName
	  * @param attribute
	  */
	public getFromProperty<T extends IAttribute<any>>(prototype: Object, propertyName: string, attribute: T): IAttributeInstance<T>[];
	public getFromProperty(prototype: Object, propertyName: string, attribute?: IAttribute<any>): IAttributeInstance<IAttribute<any>>[] {
		let attributes = [...(this.properties.get(prototype)?.get(propertyName) ?? [])];

		if (typeof attribute !== 'undefined') {
			attributes = attributes.filter(attr => {
				return (attr.constructor === attribute._constructor);
			});
		}

		return attributes;
	}

	/**
	 * Returns true if the given property has an attribute of the specified type.
	 *
	 * @param prototype
	 * @param propertyName
	 * @param attribute
	 */
	public hasFromProperty(prototype: Object, propertyName: string, attribute: IAttribute<any>) {
		const attributes = this.properties.get(prototype)?.get(propertyName);

		if (attributes) {
			for (const attr of attributes) {
				if (attr.constructor === attribute._constructor) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Returns all registered instances of the specified attribute across the application. You should avoid using
	 * this method if possible.
	 *
	 * @param attribute
	 * @returns
	 */
	public getInstances<T extends IAttribute<any>>(attribute: T): IRegisteredTarget<T>[] {
		const results = new Array<IRegisteredTarget<T>>();

		if (this.attributes.has(attribute._constructor)) {
			for (const [instance, target] of this.attributes.get(attribute._constructor)!) {
				results.push({
					...target,
					attribute: instance as any
				});
			}
		}

		return results;
	}

}

/**
 * The global registry for attributes. You can use this to:
 *
 * - Retrieve attribute instances on a target class, method, etc.
 * - Retrieve all instances of an attribute across the application.
 */
export const attributes = new AttributeRegistry();

export type IRegisteredClass = {
	type: 'class';
	constructor: Type<unknown>;
}

export type IRegisteredMethod = {
	type: 'method';
	prototype: Object;
	methodName: string;
}

export type IRegisteredProperty = {
	type: 'property';
	prototype: Object;
	propertyName: string;
}

export type IRegisteredParameter = {
	type: 'parameter';
	prototype: Object;
	methodName: string;
	parameterIndex: number;
}

type ITarget = IRegisteredClass | IRegisteredMethod | IRegisteredProperty | IRegisteredParameter;
export type IRegisteredTarget<T extends IAttribute<any>> = ITarget & {
	attribute: IAttributeInstance<T>;
};
