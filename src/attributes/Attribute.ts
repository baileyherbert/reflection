import { EventEmitter } from '@baileyherbert/events';
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

export interface Attribute<T extends Object = Object, D = any> {
	/**
	 * @internal
	 */
	constructor: IAttributeConstructor;
}

/**
 * The base class for an attribute decorator.
 */
export abstract class Attribute<T extends Object = Object, D = any> {

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
	public onMethod(event: AttributeMethodEvent<T, D>): any {
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
		const events = new EventEmitter<AttributeEvents<T>>() as any;

		return Object.assign(function(...args: any[]) {
			const apply = function(...decorationArgs: any[]) {
				let instance = new attribute(...args);
				let returned: any;
				let name: string;

				// Parameters
				if (typeof decorationArgs[2] === 'number') {
					const [prototypeRaw, methodNameRaw, parameterIndex] = decorationArgs;
					const prototype = methodNameRaw === undefined ? prototypeRaw.prototype : prototypeRaw;
					const methodName = methodNameRaw ?? 'constructor';

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
					events.emit('parameterAttached', prototype, methodName, parameterIndex, instance);
					events.emit('attached', instance, 'parameter');
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
					events.emit('classAttached', constructor, instance);
					events.emit('attached', instance, 'class');
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
					events.emit('propertyAttached', prototype, propertyName, instance);
					events.emit('attached', instance, 'property');
				}

				// Methods
				else {
					const [prototype, methodName, descriptor] = decorationArgs;

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
						reflection,
						descriptor
					});

					attributes._registerMethodAttribute(prototype, methodName, instance);
					events.emit('methodAttached', prototype, methodName, descriptor, instance);
					events.emit('attached', instance, 'method');
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
			_constructor: attribute,
			events
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
export type IAttributeArgs<T extends IAttributeConstructor> = OverloadedArguments<T>;

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
 * Defines the generic `<D>` type of an attribute, which constrains the types of methods it can be applied to.
 */
export type IAttributeMethodType<T extends IAttributeConstructor> = T extends new (...args: any[]) => Attribute<any, infer A> ?
	A : never;

/**
 * Defines a class decorator.
 */
export type IAttributeClassDecorator<T = any> = {
	(constructor: Constructor<T>): void;
}

/**
 * Defines a method decorator.
 *
 * @template D The function signature that methods must match.
 */
export type IAttributeMethodDecorator<T = any, D = any> = {
	(prototype: T, methodName: string, descriptor: TypedPropertyDescriptor<D>): void;
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
		(IfAny<ReturnType<IAttributeClass<T>['onMethod']>, null, IAttributeMethodDecorator<IAttributeType<T>, IAttributeMethodType<T>>>) |
		(IfAny<ReturnType<IAttributeClass<T>['onProperty']>, null, IAttributePropertyDecorator<IAttributeType<T>>>) |
		(IfAny<ReturnType<IAttributeClass<T>['onParameter']>, null, IAttributeParameterDecorator<IAttributeType<T>>>)
	>>;

	/**
	 * The attribute's underlying constructor.
	 * @internal
	 */
	_constructor: IAttributeConstructor;

	/**
	 * An event emitter object that tracks events for this attribute.
	 */
	events: EventEmitter<AttributeEvents<T>>;
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
	IfAny<ReturnType<IAttributeClass<T>['onMethod']>, {}, { (prototype: IAttributeType<T>, methodName: string, descriptor: TypedPropertyDescriptor<IAttributeMethodType<T>>): void; }>
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

type OverloadedArguments<T> = FixArguments<
	T extends {
		new (...args: infer A1): any;
		new (...args: infer A2): any;
		new (...args: infer A3): any;
		new (...args: infer A4): any;
		new (...args: infer A5): any;
		new (...args: infer A6): any;
	} ? FilterArg<A1> | FilterArg<A2> | FilterArg<A3> | FilterArg<A4> | FilterArg<A5> | FilterArg<A6> :
	T extends {
		new (...args: infer A1): any;
		new (...args: infer A2): any;
		new (...args: infer A3): any;
		new (...args: infer A4): any;
		new (...args: infer A5): any;
	} ? FilterArg<A1> | FilterArg<A2> | FilterArg<A3> | FilterArg<A4> | FilterArg<A5> :
	T extends {
		new (...args: infer A1): any;
		new (...args: infer A2): any;
		new (...args: infer A3): any;
		new (...args: infer A4): any
	} ? FilterArg<A1> | FilterArg<A2> | FilterArg<A3> | FilterArg<A4> :
	T extends {
		new (...args: infer A1): any;
		new (...args: infer A2): any;
		new (...args: infer A3): any
	} ? FilterArg<A1> | FilterArg<A2> | FilterArg<A3> :
	T extends {
	  	new (...args: infer A1): any;
	  	new (...args: infer A2): any
	} ? FilterArg<A1> | FilterArg<A2> :
	T extends new (...args: infer A) => any ? FilterArg<A> : any>;

/**
 * This is a utility symbol to fix arguments from `OverloadedArguments<T>`.
 * The problem is that in some conditions, `unknown[]` will sneak its way into the unions.
 * This, combined with the two types below it, can reliably filter those out.
 */
const Noop: unique symbol = Symbol();
type FilterArg<T> = unknown[] extends T ? typeof Noop : T;
type FixArguments<T> = T extends typeof Noop ? never : T;

type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;
type UnionToIntersection<U> = (U extends any ? (argument: U) => void : never) extends
	(argument: infer I) => void ? I : never;

type AttachmentType = 'class' | 'method' | 'property' | 'parameter';

type AttributeEvents<T extends IAttributeConstructor> = {
	/**
	 * Invoked when the attribute is attached to anything.
	 */
	attached: [attribute: IAttributeInstance<IAttribute<T>>, type: AttachmentType];

	/**
	 * Invoked when the attribute is attached to a class.
	 */
	classAttached: [constructor: Constructor<IAttributeType<T>>, attribute: IAttributeInstance<IAttribute<T>>];

	/**
	 * Invoked when the attribute is attached to a method.
	 */
	methodAttached: [prototype: IAttributeType<T>, methodName: string, descriptor: TypedPropertyDescriptor<IAttributeMethodType<T>>, attribute: IAttributeInstance<IAttribute<T>>];

	/**
	 * Invoked when the attribute is attached to a property.
	 */
	propertyAttached: [prototype: IAttributeType<T>, propertyName: string, attribute: IAttributeInstance<IAttribute<T>>];

	/**
	 * Invoked when the attribute is attached to a method parameter.
	 */
	parameterAttached: [prototype: IAttributeType<T>, methodName: string, parameterIndex: number, attribute: IAttributeInstance<IAttribute<T>>];
};

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
