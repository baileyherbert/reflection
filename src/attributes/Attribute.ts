import { Constructor, Delegate } from '@baileyherbert/types';
import { ReflectionClass } from '../main';
import { attributes } from './AttributeRegistry';
import { AttributeClassEvent } from './events/AttributeClassEvent';
import { AttributeMethodEvent } from './events/AttributeMethodEvent';
import { AttributeParameterEvent } from './events/AttributeParameterEvent';
import { AttributePropertyEvent } from './events/AttributePropertyEvent';

/**
 * @internal
 */
export const NO_IMPL = Symbol();

/**
 * @internal
 */
export const ATTR_OPTIONS = {
	emitInvalidUsageErrors: true
};

export interface Attribute<T extends Object = Object> {
	/**
	 * @internal
	 */
	constructor: IAttributeConstructor;
}

/**
 * The base class for an attribute decorator.
 */
export abstract class Attribute<T extends Object = Object> {

	/**
	 * Invoked when the attribute is applied to a class.
	 *
	 * @param event An object containing details about the event.
	 */
	public onClass(event: AttributeClassEvent<T>): any {
		return NO_IMPL;
	}

	/**
	 * Invoked when the attribute is applied to a method.
	 *
	 * @param event An object containing details about the event.
	 */
	public onMethod(event: AttributeMethodEvent<T>): any {
		return NO_IMPL;
	}

	/**
	 * Invoked when the attribute is applied to a property.
	 *
	 * @param event An object containing details about the event.
	 */
	public onProperty(event: AttributePropertyEvent<T>): any {
		return NO_IMPL;
	}

	/**
	 * Invoked when the attribute is applied to a parameter.
	 *
	 * @param event An object containing details about the event.
	 */
	public onParameter(event: AttributeParameterEvent<T>): any {
		return NO_IMPL;
	}

	/**
	 * Creates an invokable attribute from an attribute class. The returned value can be used as both a class
	 * constructor and a decorator.
	 *
	 * When creating an attribute, you should export this value, rather than the class itself. You can also pass the
	 * attribute class into this method as an anonymous or returned class.
	 *
	 * @param attribute
	 * @returns
	 */
	public static create<T extends IAttributeConstructor>(attribute: T): IAttribute<T> {
		return Object.assign(function(...args: any[]) {
			const apply = function(...decorationArgs: any[]) {
				let instance = new attribute(...args);
				let returned: any;
				let name: string;

				// Parameters
				if (typeof decorationArgs[2] === 'number') {
					const [prototype, methodName, parameterIndex] = decorationArgs;

					const ref = new ReflectionClass(prototype.constructor);
					const reflection = ref.getMethod(methodName)?.getParameter(parameterIndex);

					name = `parameter ${ref.name}::${methodName}[${parameterIndex}]`;

					if (!reflection) {
						throw new Error(
							`Failed to build reflection on ${name} for attribute ${attribute.name}`
						);
					}

					let parameters = Reflect.getOwnMetadata('reflection:params', prototype, methodName);

					if (parameters === undefined) {
						parameters = new Array<Map<any, any>>();
						Reflect.defineMetadata('reflection:params', parameters, prototype, methodName);
					}

					if (!(parameterIndex in parameters)) {
						parameters[parameterIndex] = new Map();
					}

					returned = instance.onParameter({
						prototype,
						methodName,
						parameterIndex,
						reflection
					});

					attributes._registerParameterAttribute(prototype, methodName, parameterIndex, instance);
				}

				// Classes
				else if (typeof decorationArgs[1] === 'undefined') {
					const [constructor] = decorationArgs;

					name = `class ${constructor.name}`;
					returned = instance.onClass({
						constructor,
						reflection: new ReflectionClass(constructor)
					});

					attributes._registerClassAttribute(constructor, instance);
				}

				// Properties
				else if (typeof decorationArgs[1] !== 'undefined' && !(decorationArgs[1] in decorationArgs[0])) {
					const [prototype, propertyName] = decorationArgs;

					const properties = Reflect.getOwnMetadata('reflection:properties', prototype.constructor)
						?? new Set();

					if (!properties.has(propertyName)) {
						properties.add(propertyName);

						if (properties.size === 1) {
							Reflect.metadata('reflection:properties', properties)(prototype.constructor);
						}
					}

					const ref = new ReflectionClass(prototype.constructor);
					const reflection = ref.getProperty(decorationArgs[1]);

					name = `property ${ref.name}::${propertyName}`;

					if (!reflection) {
						throw new Error(
							`Failed to build reflection on ${name} for attribute ${attribute.name}`
						);
					}

					returned = instance.onProperty({
						prototype,
						propertyName,
						reflection
					});

					attributes._registerPropertyAttribute(prototype, propertyName, instance);
				}

				// Methods
				else {
					const [prototype, methodName] = decorationArgs;

					const ref = new ReflectionClass(prototype.constructor);
					const reflection = ref.getMethod(methodName);

					name = `method ${ref.name}::${methodName}`;

					if (!reflection) {
						throw new Error(
							`Failed to build reflection on ${name} for attribute ${attribute.name}`
						);
					}

					returned = instance.onMethod({
						prototype,
						methodName,
						reflection
					});

					attributes._registerMethodAttribute(prototype, methodName, instance);
				}

				// Check if the returned value is NO_IMPL
				// If it is, then the attribute doesn't support that type of decoration
				if (returned === NO_IMPL && ATTR_OPTIONS.emitInvalidUsageErrors) {
					throw new Error(`Attribute ${attribute.name} cannot be applied to ${name}`);
				}
			}

			if (new.target) {
				return new attribute(...args);
			}
			else if (isDecoratorCall(args)) {
				const ref = new ReflectionClass(attribute);
				const method = ref.getConstructorMethod();

				if (method.getParameters().length === 0) {
					const originalArgs = args;
					args = [];
					return apply(...originalArgs);
				}
			}

			return apply;
		}, {
			_constructor: attribute
		}) as any;
	}

}

/**
 * Defines the constructor for the underlying class of an attribute.
 */
export type IAttributeConstructor = new (...args: any[]) => Attribute;

/**
 * Defines the constructor arguments of an attribute.
 */
export type IAttributeArgs<T extends IAttributeConstructor> = T extends new (...args: infer A) => Attribute ? A : [];

/**
 * Defines the underlying class of an attribute.
 */
export type IAttributeClass<T extends IAttributeConstructor> = T extends new (...args: any[]) => infer C ? C : never;

/**
 * Defines the generic `<T>` type of an attribute, which constrains the types of classes it can be applied to.
 */
export type IAttributeType<T extends IAttributeConstructor> = T extends new (...args: any[]) => Attribute<infer A> ?
	A : never;

/**
 * Defines a class decorator.
 */
export type IAttributeClassDecorator<T = any> = {
	(constructor: Constructor<T>): void;
}

/**
 * Defines a method decorator.
 */
export type IAttributeMethodDecorator<T = any> = {
	(prototype: T, methodName: string, descriptor: TypedPropertyDescriptor<Delegate<any>>): void;
}

/**
 * Defines a property decorator.
 */
export type IAttributePropertyDecorator<T = any> = {
	(prototype: T, propertyName: string, descriptor: void): void;
}

/**
 * Defines a parameter decorator.
 */
export type IAttributeParameterDecorator<T = any> = {
	(prototype: T, methodName: string, parameterIndex: number): void;
}

/**
 * Defines a wrapped attribute that can be both invoked as a decorator and instantiated like a class constructor.
 */
export type IAttribute<T extends IAttributeConstructor> = IAttributeDefined<T,
	IAttributeCallable<T> &
	IClassWithoutParenthesis<T> &
	IMethodWithoutParenthesis<T> &
	IPropertyWithoutParenthesis<T> &
	IParameterWithoutParenthesis<T>,
	never
>;

/**
 * Defines a final attribute function that can be both called as a decorator and instantiated as an object.
 */
export interface IAttributeCallable<T extends IAttributeConstructor> {
	new(...args: IAttributeArgs<T>): IAttributeClass<T>;

	(...args: IAttributeArgs<T>): UnionToIntersection<NonNullable<
		(IfAny<ReturnType<IAttributeClass<T>['onClass']>, null, IAttributeClassDecorator<IAttributeType<T>>>) |
		(IfAny<ReturnType<IAttributeClass<T>['onMethod']>, null, IAttributeMethodDecorator<IAttributeType<T>>>) |
		(IfAny<ReturnType<IAttributeClass<T>['onProperty']>, null, IAttributePropertyDecorator<IAttributeType<T>>>) |
		(IfAny<ReturnType<IAttributeClass<T>['onParameter']>, null, IAttributeParameterDecorator<IAttributeType<T>>>)
	>>;

	/**
	 * The attribute's underlying constructor.
	 * @internal
	 */
	_constructor: IAttributeConstructor;
}

/**
 * Defines whether an attribute has any applicable targets or not.
 */
export type IAttributeDefined<T extends IAttributeConstructor, Y, N> = IfAny<T, Y, NonNullable<(
	IfAny<ReturnType<IAttributeClass<T>['onClass']>, null, true> |
	IfAny<ReturnType<IAttributeClass<T>['onMethod']>, null, true> |
	IfAny<ReturnType<IAttributeClass<T>['onProperty']>, null, true> |
	IfAny<ReturnType<IAttributeClass<T>['onParameter']>, null, true>
)> extends never ? N : Y>;

type IClassWithoutParenthesis<T extends IAttributeConstructor> = T extends new () => any ?
	IfAny<ReturnType<IAttributeClass<T>['onClass']>, {}, { (constructor: Constructor<IAttributeType<T>>): void; }>
	: {}

type IMethodWithoutParenthesis<T extends IAttributeConstructor> = T extends new () => any ?
	IfAny<ReturnType<IAttributeClass<T>['onMethod']>, {}, { (prototype: IAttributeType<T>, methodName: string, descriptor: TypedPropertyDescriptor<Delegate<any>>): void; }>
	: {}

type IPropertyWithoutParenthesis<T extends IAttributeConstructor> = T extends new () => any ?
	IfAny<ReturnType<IAttributeClass<T>['onProperty']>, {}, { (prototype: IAttributeType<T>, propertyName: string, descriptor: void): void; }>
	: {}

type IParameterWithoutParenthesis<T extends IAttributeConstructor> = T extends new () => any ?
	IfAny<ReturnType<IAttributeClass<T>['onParameter']>, {}, { (prototype: IAttributeType<T>, methodName: string, parameterIndex: number): void; }>
	: {}

/**
 * Describes an instance of an attribute's underlying class with the decoration methods hidden.
 *
 * @example
 *   class MyAttribute extends Attribute {}
 *   const instance: AttributeInstance<MyAttribute>;
 */
export type IAttributeInstance<T extends IAttribute<any>> = (T extends IAttribute<infer C> ? (
	Omit<IAttributeClass<C> & {
			onClass: IAttributeClassDecorator,
			onMethod: IAttributeMethodDecorator,
			onProperty: IAttributePropertyDecorator,
			onParameter: IAttributeParameterDecorator
		},
		'onClass' | 'onMethod' | 'onProperty' | 'onParameter'
	>): never) & Omit<Attribute<any>, 'onClass' | 'onMethod' | 'onProperty' | 'onParameter'>;

type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;
type UnionToIntersection<U> = (U extends any ? (argument: U) => void : never) extends
	(argument: infer I) => void ? I : never;

/**
 * Returns true if the given arguments are for a decorator.
 *
 * @param args
 */
function isDecoratorCall(args: any[]) {
	if (typeof args[0] === 'function' && args[0].hasOwnProperty('prototype')) {
		return true;
	}

	if (typeof args[0] === 'object' && args[0].hasOwnProperty('constructor')) {
		if (typeof args[1] === 'string') {
			if (typeof args[2] === 'number' || typeof args[2] === 'undefined') {
				return true;
			}

			if (typeof args[2] === 'object' && args[2].hasOwnProperty('enumerable') && args[2].hasOwnProperty('value')) {
				return true;
			}
		}
	}

	return false;
}
