import { ParameterFilter } from '../enums/ParameterFilter';
import { IAttribute, IAttributeInstance } from '../attributes/Attribute';
import { attributes } from '../attributes/AttributeRegistry';
import { ParameterParser } from '../utilities/ParameterParser';
import { ReflectionClass } from './ReflectionClass';
import { ReflectionParameter } from './ReflectionParameter';

// @ts-ignore
const isBrowser: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const customInspectSymbol = isBrowser ? Symbol() : require('util').inspect.custom;

export class ReflectionMethod<T = unknown> {

	/**
	 * The name of the method.
	 */
	public readonly name: string;

	/**
	 * The class this method belongs to.
	 */
	public readonly class: ReflectionClass<T>;

	/**
	 * The prototype that this method lives in.
	 */
	private _proto: any;

	/**
	 * The `design:type` value from TypeScript when available.
	 */
	private _designType?: any;

	/**
	 * The `design:paramtypes` value from TypeScript when available.
	 */
	private _designParamTypes?: any;

	/**
	 * The `design:returntype` value from TypeScript when available.
	 */
	private _designReturnType?: any;

	/**
	 * Parameter cache.
	 */
	private _parameters?: ReflectionParameter<T>[];

	/**
	 * Internal constructor.
	 *
	 * @param parent
	 * @param name
	 * @param proto
	 * @internal
	 */
	public constructor(parent: ReflectionClass<T>, name: string, proto: any) {
		this.name = name;
		this.class = parent;
		this._proto = proto;

		this._designType = this.getMetadata('design:type');
		this._designParamTypes = this.getMetadata('design:paramtypes');
		this._designReturnType = this.getMetadata('design:returntype');
	}

	/**
	 * The prototype that the method is defined on.
	 */
	public get prototype() {
		return this._proto;
	}

	/**
	 * Returns the prototype function for this method.
	 *
	 * @returns
	 */
	public getFunction(): Function {
		return this._proto[this.name];
	}

	/**
	 * Returns a function that can be invoked to call the method.
	 *
	 * For static methods, no arguments should be supplied. For local methods, you must provide an instance of the
	 * parent class to invoke the method on.
	 *
	 * @param object
	 * @returns
	 */
	public getClosure(object?: T | null): (...args: any[]) => any {
		if (this.isStatic) {
			if (object !== undefined && object !== null) {
				throw new Error('Cannot call static method on an object');
			}

			return (...args: any[]) => this._proto[this.name](...args);
		}

		if (object === undefined || object === null) {
			throw new Error('Cannot call local method without specifying a target object');
		}

		if (!(object instanceof this.class.target)) {
			throw new Error('Attempt to call local method on an object from a different type');
		}

		// @ts-ignore
		return (...args: any[]) => object[this.name](...args);
	}

	/**
	 * Invokes the method.
	 *
	 * For static methods, the `object` argument should not be supplied. For local methods, you must provide an
	 * instance of the parent class to invoke the method on.
	 *
	 * @param object
	 * @param args
	 * @returns
	 */
	public invoke(object?: T | null, ...args: any[]) {
		const closure = this.getClosure(object);
		return closure(...args);
	}

	/**
	 * Returns `true` if this method is the class constructor.
	 *
	 * @returns
	 */
	public get isConstructor() {
		return this.name === 'constructor';
	}

	/**
	 * Returns `true` if this method is static.
	 *
	 * @returns
	 */
	public get isStatic() {
		// @ts-ignore
		return typeof this.class.target[this.name] === 'function' && !this.isConstructor;
	}

	/**
	 * Returns `true` if design type information is available for this method.
	 *
	 * TypeScript will not output design information, such as parameter and return types, unless the method has at
	 * least one decorator applied.
	 */
	public get isTyped() {
		return this._designType !== undefined || this._designParamTypes !== undefined;
	}

	/**
	 * Returns the type that the method can return. This will not be a reflected object but instead a generic object
	 * like `Function` or `Object`.
	 *
	 * **Note:** Returns `Object` for union types.
	 *
	 * @returns
	 */
	public getReturnType() {
		return this._designReturnType;
	}

	/**
	 * Returns a string representing the method's return type. This will be identical to what `typeof` would return.
	 *
	 * **Note:** Returns `object` for union types.
	 *
	 * @returns
	 */
	public getReturnTypeString() {
		const type = this._designReturnType;

		switch (type) {
			case undefined: return 'undefined';
			case null: return 'object';
			case Boolean: return 'boolean';
			case Number: return 'number';
			case BigInt: return 'bigint';
			case String: return 'string';
			case Symbol: return 'symbol';
			case Function: return 'function';
		}

		return 'object';
	}

	/**
	 * Parses parameters from the method's definition. For the constructor method, it walks up until it finds a
	 * constructor method (it also uses slower parsing to pick out the constructor from the class definition).
	 *
	 * @returns
	 */
	protected parseParameters() {
		if (this.name === 'constructor') {
			const chain = this.class.getHierarchy().reverse();

			for (const target of chain) {
				const func = Function.toString.call(target.prototype.constructor);
				const result = ParameterParser.parse(func, 'constructor');

				if (result !== false) {
					return result;
				}
			}

			return [];
		}
		else {
			const func = Function.toString.call(this.getFunction());
			return ParameterParser.parse(func);
		}
	}

	/**
	 * Returns the parameters for this method.
	 *
	 * @param filter Optional filter(s) for the parameters to return.
	 * @returns An array of `ReflectionParameter` instances.
	 */
	public getParameters(filter?: ParameterFilter): ReflectionParameter<T>[] {
		if (this._parameters === undefined) {
			const schema = this.parseParameters();
			const params = new Array<ReflectionParameter<T>>();

			for (const item of schema) {
				params.push(new ReflectionParameter(
					this,
					item,
					this.isTyped ? this._designParamTypes[item.index] : undefined
				));
			}

			this._parameters = params;
		}

		// Apply filters
		if (filter !== undefined) {
			return [...this._parameters].filter(param => {
				let flags: ParameterFilter = 0;

				flags |= this.hasParameterMeta(param.index) ? ParameterFilter.Meta : 0;
				flags |= param.hasDefault ? ParameterFilter.WithDefault : ParameterFilter.WithoutDefault;
				flags |= param.isPrimitiveType ? ParameterFilter.PrimitiveType : ParameterFilter.NonPrimitiveType;
				flags |= param.isKnownType ? ParameterFilter.KnownType : ParameterFilter.UnknownType;

				return (flags & filter) > 0;
			});
		}

		return [...this._parameters];
	}

	/**
	 * Returns the parameter matching the specified name.
	 *
	 * @param name The name of the parameter (case sensitive).
	 * @param filter Optional filter(s) for the parameters to check.
	 * @returns The `ReflectionParameter` instance for the specified parameter or `undefined` if not found.
	 */
	public getParameter(name: string, filter?: ParameterFilter): ReflectionParameter<T> | undefined;

	/**
	 * Returns the parameter at the specified index.
	 *
	 * @param index The zero-based index to retrieve.
	 * @returns The `ReflectionParameter` instance for the specified parameter or `undefined` if not found.
	 */
	public getParameter(index: number): ReflectionParameter<T> | undefined;
	public getParameter(name: string | number, filter?: ParameterFilter): ReflectionParameter<T> | undefined {
		if (typeof name === 'number') {
			return this.getParameters()[name];
		}

		for (const param of this.getParameters(filter)) {
			if (param.name === name) {
				return param;
			}
		}

		return;
	}

	/**
	 * Returns `true` if the method contains a parameter with the specified name.
	 *
	 * @param name The name of the parameter (case sensitive).
	 * @param filter Optional filter(s) for the parameters to check.
	 * @returns Whether or not there is a parameter with that name.
	 */
	public hasParameter(name: string, filter?: ParameterFilter): boolean {
		for (const param of this.getParameters(filter)) {
			if (param.name === name) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns `true` if there is metadata for the specified parameter index.
	 *
	 * @param index
	 * @returns
	 * @internal
	 */
	public hasParameterMeta(index: number) {
		let params = this.getMetadata('reflection:params');

		if (params === undefined) {
			return false;
		}

		if (!(index in params)) {
			return false;
		}

		return params[index].size > 0;
	}

	/**
	 * Returns all attributes on the method.
	 */
	public getAttributes(): IAttributeInstance<any>[];

	/**
	 * Returns all attributes of the specified type on the method.
	 *
	 * @param attribute
	 */
	public getAttributes<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T>[];
	public getAttributes(attribute?: IAttribute<any>) {
		return attributes.getFromMethod(this._proto, this.name, attribute!);
	}

	/**
	 * Returns the last attribute of the specified type on the method.
	 *
	 * @param attribute
	 */
	public getAttribute<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T> | undefined {
		return attributes.getFromMethod(this._proto, this.name, attribute).shift();
	}

	/**
	 * Returns the value of metadata for the method under the specified key.
	 *
	 * @param name
	 * @returns
	 */
	public getMetadata<T = any>(name: any): T | undefined {
		if (this.name === 'constructor') {
			return this.class.getMetadata(name);
		}

		return Reflect.getMetadata(name, this._proto, this.name);
	}

	/**
	 * Returns an object of all metadata on this method.
	 */
	public getAllMetadata() {
		if (this.name === 'constructor') {
			return this.class.getAllMetadata();
		}

		const keys = Reflect.getMetadataKeys(this._proto, this.name);
		const result = new Map<any, any>();

		for (const key of keys) {
			result.set(key, Reflect.getMetadata(key, this._proto, this.name));
		}

		return result;
	}

	/**
	 * Sets the value of metadata for the method under the specified key.
	 *
	 * @param name The metadata key.
	 * @param value The metadata value.
	 */
	public setMetadata(name: any, value: any) {
		if (this.name === 'constructor') {
			return this.class.setMetadata(name, value);
		}

		return Reflect.defineMetadata(name, value, this._proto, this.name);
	}

	/**
	 * Returns `true` if there is metadata with the given name on this method.
	 *
	 * @param name The metadata key.
	 */
	public hasMetadata(name: any) {
		if (this.name === 'constructor') {
			return this.class.hasMetadata(name);
		}

		return Reflect.hasMetadata(name, this._proto, this.name);
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
			isTyped: this.isTyped,
			isStatic: this.isStatic,
			returnType: this.getReturnType(),
			returnTypeString: this.getReturnTypeString(),
			metadata: Object.assign({}, ...[...this.getAllMetadata().entries()].map(([k, v]) => ({[k]: v}))),
			parameters: this.getParameters()
		};
	}

}
