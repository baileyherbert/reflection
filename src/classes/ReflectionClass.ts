import { Type } from '@baileyherbert/types';
import { MethodFilter } from '../enums/MethodFilter';
import { PropertyFilter } from '../enums/PropertyFilter';
import { IAttribute, IAttributeInstance } from '../attributes/Attribute';
import { attributes } from '../attributes/AttributeRegistry';
import { isConstructor } from '../utilities/types';
import { ReflectionMethod } from './ReflectionMethod';
import { ReflectionProperty } from './ReflectionProperty';

// @ts-ignore
const isBrowser: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const customInspectSymbol = isBrowser ? Symbol() : require('util').inspect.custom;

/**
 * This utility class is used to work with reflection on a class.
 *
 * Before using reflection, you must ensure that `emitDecoratorMetadata` is set to `true` in your tsconfig file. You
 * must also apply at least one decorator to the class. If you need to, use the `@Reflectable()` decorator provided by
 * this library.
 */
export class ReflectionClass<T = unknown> {

	/**
	 * The class constructor function.
	 */
	private _constructor: Type<T>;

	/**
	 * A reflection object for the parent class if applicable.
	 */
	private _parent?: ReflectionClass<any>;

	/**
	 * Internal cache for methods.
	 */
	private _methods?: Map<string, ReflectionMethod<T>>;

	/**
	 * Internal cache for properties.
	 */
	private _properties?: Map<string, ReflectionProperty<T>>;

	/**
	 * Constructs a new `ReflectionClass` object for the given class constructor.
	 *
	 * @param constructor The class constructor (a reference to the class itself)
	 */
	public constructor(constructor: Type<T>);

	/**
	 * Constructs a new `ReflectionClass` object for the given class instance.
	 *
	 * @param object An object of the target class.
	 */
	public constructor(object: T);
	public constructor(object: any) {
		if (typeof object === 'object') {
			object = object.constructor;
		}

		if (typeof object !== 'function') {
			throw new Error('Expected function or object, got ' + typeof object);
		}

		this._constructor = object;

		const parent = Object.getPrototypeOf(this._constructor.prototype);
		if (parent !== null && parent.constructor !== Object) {
			this._parent = new ReflectionClass<any>(parent);
		}
	}

	/**
	 * Returns the methods in this class.
	 *
	 * @param filter Optional filter(s) for the methods to return.
	 * @returns An array of `ReflectionMethod` instances.
	 */
	public getMethods(filter?: MethodFilter): ReflectionMethod<T>[] {
		if (this._methods === undefined) {
			const methods = new Map<string, ReflectionMethod<T>>();

			// Add methods from the prototype
			for (const methodName of Object.getOwnPropertyNames(this._constructor.prototype)) {
				const proto = this._constructor.prototype[methodName];

				if (typeof proto === 'function') {
					const method = new ReflectionMethod<T>(this, methodName, this._constructor.prototype);
					methods.set(method.name, method);
				}
			}

			// Add methods from the class itself
			for (const methodName of Object.getOwnPropertyNames(this._constructor)) {
				// @ts-ignore
				const proto = this._constructor[methodName];

				if (typeof proto === 'function') {
					const method = new ReflectionMethod<T>(this, methodName, this._constructor);
					methods.set(method.name, method);
				}
			}

			// Add methods from parent classes
			if (this._parent !== undefined) {
				for (const method of this._parent.getMethods()) {
					if (!methods.has(method.name)) {
						methods.set(method.name, method);
					}
				}
			}

			this._methods = methods;
		}

		// Apply filters
		if (filter !== undefined) {
			return [...this._methods.values()].filter(method => {
				let flags: MethodFilter = 0;

				flags |= method.isStatic ? MethodFilter.Static : MethodFilter.Local;
				flags |= method.isTyped ? MethodFilter.Typed : 0;
				flags |= method.class === this ? MethodFilter.Own : MethodFilter.Inherited;

				return (flags & filter) > 0;
			});
		}

		return [...this._methods.values()];
	}

	/**
	 * Returns `true` if the class contains a method with the specified name.
	 *
	 * @param name The name of the method (case sensitive).
	 * @param filter Optional filter for method matching.
	 * @returns Whether or not there is a method with that name.
	 */
	public hasMethod(name: string, filter?: MethodFilter): boolean {
		for (const method of this.getMethods(filter)) {
			if (method.name === name) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns a method from the class.
	 *
	 * @param name The name of the method (case sensitive).
	 * @param filter Optional filter for method matching.
	 * @returns The `ReflectionMethod` instance for the specified method or `undefined` if not found.
	 */
	public getMethod(name: string, filter?: MethodFilter): ReflectionMethod<T> | undefined {
		for (const method of this.getMethods(filter)) {
			if (method.name === name) {
				return method;
			}
		}

		return;
	}

	/**
	 * Returns the `constructor` method for this class.
	 */
	public getConstructorMethod(): ReflectionMethod<T> {
		return this.getMethod('constructor')!;
	}

	/**
	 * Returns the properties in this class.
	 *
	 * @param filter Optional filter(s) for the properties to return.
	 * @returns An array of `ReflectionProperty` instances.
	 */
	public getProperties(filter?: PropertyFilter): ReflectionProperty<T>[] {
		if (this._properties === undefined) {
			const properties = new Map<string, ReflectionProperty<T>>();

			// Add properties from the prototype
			for (const propertyName of [...this.getMetadata('reflection:properties') ?? []]) {
				const property = new ReflectionProperty<T>(this, propertyName, this._constructor.prototype);
				properties.set(propertyName, property);
			}

			// Add properties from parent classes
			if (this._parent !== undefined) {
				for (const property of this._parent.getProperties()) {
					if (!properties.has(property.name)) {
						properties.set(property.name, property);
					}
				}
			}

			this._properties = properties;
		}

		// Apply filters
		if (filter !== undefined) {
			return [...this._properties.values()].filter(prop => {
				let flags: PropertyFilter = 0;

				flags |= prop.isTyped ? PropertyFilter.Typed : 0;
				flags |= prop.class === this ? PropertyFilter.Own : PropertyFilter.Inherited;

				return (flags & filter) > 0;
			});
		}

		return [...this._properties.values()];
	}

	/**
	 * Returns `true` if the class contains a property with the specified name.
	 *
	 * @param name The name of the property (case sensitive).
	 * @param filter Optional filter for property matching.
	 * @returns Whether or not there is a property with that name.
	 */
	public hasProperty(name: string, filter?: PropertyFilter): boolean {
		for (const prop of this.getProperties(filter)) {
			if (prop.name === name) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns a property from the class.
	 *
	 * @param name The name of the property (case sensitive).
	 * @param filter Optional filter for property matching.
	 * @returns The `ReflectionProperty` instance for the specified property or `undefined` if not found.
	 */
	public getProperty(name: string, filter?: PropertyFilter): ReflectionProperty<T> | undefined {
		for (const prop of this.getProperties(filter)) {
			if (prop.name === name) {
				return prop;
			}
		}

		return;
	}

	/**
	 * Returns all attributes on the class.
	 */
	public getAttributes(): IAttributeInstance<any>[];

	/**
	 * Returns all attributes of the specified type on the class.
	 *
	 * @param attribute
	 */
	public getAttributes<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T>[];
	public getAttributes(attribute?: IAttribute<any>) {
		return attributes.getFromClass(this._constructor, attribute!);
	}

	/**
	 * Returns the last attribute of the specified type on the class.
	 *
	 * @param attribute
	 */
	public getAttribute<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T> | undefined {
		return attributes.getFromClass(this._constructor, attribute).shift();
	}

	/**
	 * Returns true if the class has an attribute of the specified type.
	 *
	 * @param attribute
	 */
	public hasAttribute<T extends IAttribute<any>>(attribute: T) {
		return attributes.hasFromClass(this._constructor, attribute);
	}

	/**
	 * Returns the value of metadata for the class under the specified key.
	 *
	 * @param name
	 * @returns
	 */
	public getMetadata<T = any>(name: any): T | undefined {
		return Reflect.getMetadata(name, this._constructor);
	}

	/**
	 * Returns a `Map` containing all metadata on this class.
	 */
	public getAllMetadata() {
		const keys = Reflect.getMetadataKeys(this._constructor);
		const result = new Map<any, any>();

		for (const key of keys) {
			result.set(key, Reflect.getMetadata(key, this._constructor));
		}

		return result;
	}

	/**
	 * Sets the value of metadata for the class under the specified key.
	 *
	 * @param name The metadata key.
	 * @param value The metadata value.
	 */
	public setMetadata(name: any, value: any) {
		return Reflect.defineMetadata(name, value, this._constructor);
	}

	/**
	 * Returns `true` if there is metadata with the given name on this class.
	 *
	 * @param name The metadata key.
	 */
	public hasMetadata(name: any) {
		return Reflect.hasMetadata(name, this._constructor);
	}

	/**
	 * Returns an array of `ReflectionClass` objects representing the class hierarchy. The first element in the array
	 * will be the top super class, and the last element will be this object.
	 */
	public getHierarchy() {
		const classes = new Array<ReflectionClass<unknown>>();

		let target: ReflectionClass<any> | undefined = this;

		while (target) {
			classes.unshift(target);
			target = target.parent;
		}

		return classes;
	}

	/**
	 * Returns `true` if this class has a class within its hierarchy (including itself) which matches the given class
	 * constructor type.
	 *
	 * @param type A reference to the class to check against.
	 */
	public hasType(type: Type<any>) {
		for (const $class of this.getHierarchy()) {
			if ($class.target === type) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns `true` if this class has a class within its hierarchy (not including itself) which matches the given
	 * class constructor type.
	 *
	 * @param type A reference to the class to check against.
	 */
	public hasAncestorType(type: Type<any>) {
		for (const $class of this.getHierarchy().slice(0, -1)) {
			if ($class.target === type) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns true if this object is representing the specified constructor type.
	 *
	 * @param constructor The constructor to match against.
	 */
	public isType<T>(constructor: Type<T>): this is ReflectionClass<T> {
		// @ts-ignore
		return this._constructor === constructor;
	}

	/**
	 * Creates a new instance of this class with the given constructor parameters.
	 *
	 * @param args
	 */
	public create(args: any[] = []) {
		if (isConstructor(this._constructor)) {
			return new this._constructor(...args);
		}
		else {
			throw new Error(
				`Cannot create an instance of class ${this.name} because it is not a constructor`
			);
		}
	}

	/**
	 * The constructor function for the class.
	 */
	public get target() {
		return this._constructor;
	}

	/**
	 * The constructor function for the class.
	 *
	 * @deprecated Use `target` instead
	 */
	public get ref() {
		return this._constructor;
	}

	/**
	 * The prototype of the class.
	 */
	public get prototype() {
		return this._constructor.prototype;
	}

	/**
	 * The name of the class.
	 */
	public get name() {
		return this._constructor.name;
	}

	/**
	 * The reflection object for the parent class if applicable.
	 */
	public get parent() {
		return this._parent;
	}

	/**
	 * Custom inspect method.
	 *
	 * @param depth
	 * @param opts
	 * @returns
	 */
	private [customInspectSymbol](depth: number, opts: object) {
		return {
			name: this.name,
			target: this.target,
			parent: this.parent,
			metadata: Object.assign({}, ...[...this.getAllMetadata().entries()].map(([k, v]) => ({[k]: v}))),
			methods: this.getMethods(),
			attributes: this.getAttributes()
		};
	}

}
