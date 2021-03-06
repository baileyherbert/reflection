import { IAttribute, IAttributeInstance } from '../attributes/Attribute';
import { attributes } from '../attributes/AttributeRegistry';
import { ExtractedParameter } from '../utilities/ParameterParser';
import { ReflectionMethod } from './ReflectionMethod';

// @ts-ignore
const isBrowser: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const customInspectSymbol = isBrowser ? Symbol() : require('util').inspect.custom;

export class ReflectionParameter<T = unknown> {

	private _method: ReflectionMethod<T>;
	private _schema: ExtractedParameter;
	private _type?: any;

	/**
	 * Internal constructor.
	 *
	 * @param method
	 * @param schema
	 * @param type
	 * @internal
	 */
	public constructor(method: ReflectionMethod<T>, schema: ExtractedParameter, type?: any) {
		this._method = method;
		this._schema = schema;
		this._type = type;
	}

	/**
	 * The method this parameter belongs to.
	 */
	public get method() {
		return this._method;
	}

	/**
	 * The index of the parameter (zero-based).
	 */
	public get index() {
		return this._schema.index;
	}

	/**
	 * The name of the parameter.
	 */
	public get name() {
		return this._schema.name;
	}

	/**
	 * Whether or not this parameter has an ES6 default value.
	 */
	public get hasDefault() {
		return this._schema.hasDefault;
	}

	/**
	 * Returns the type that the parameter accepts. This will not be a reflected object but instead a generic object
	 * like `Function` or `Object`.
	 *
	 * **Note:** Returns `Object` for union types.
	 *
	 * @returns
	 */
	public getType() {
		return this._type;
	}

	/**
	 * Returns a string representing the parameter's type. This will be identical to what `typeof` would return.
	 *
	 * **Note:** Returns `object` for union types.
	 *
	 * @returns
	 */
	public getTypeString() {
		const type = this._type;

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
	 * Whether or not this parameter's type is a primitive.
	 */
	public get isPrimitiveType() {
		return [
			'string',
			'number',
			'bigint',
			'boolean',
			'undefined',
			'symbol'
		].indexOf(this.getTypeString()) >= 0;
	}

	/**
	 * Whether or not the parameter has a known type.
	 *
	 * This will exclude types like `any`, `never`, and `unknown`, as well as any generic objects that can't be
	 * described with a specific prototype.
	 */
	public get isKnownType() {
		if (this._type === Object || this._type === Function) {
			return false;
		}

		if (this._type === undefined || this._type === null) {
			return false;
		}

		return true;
	}

	/**
	 * Whether or not the parameter accepts a constructor type. This usually means the parameter expects an instance of
	 * the associated class.
	 */
	public get isClassType() {
		const type = this.getType();

		if (typeof type === 'function') {
			if (typeof type.constructor === 'function') {
				return true;
			}
		}

		return false;
	}

	/**
	 * Whether or not the parameter's accepted type is a reflectable user class. This is basically shorthand for
	 * checking all of the following:
	 *
	 * - `isClassType` == true
	 * - `isKnownType` == true
	 * - `isPrimitiveType` == false
	 */
	public get isReflectableType() {
		return (
			this.isClassType === true &&
			this.isKnownType === true &&
			this.isPrimitiveType === false
		);
	}

	/**
	 * Returns all attributes on the parameter.
	 */
	public getAttributes(): IAttributeInstance<any>[];

	/**
	 * Returns all attributes of the specified type on the parameter.
	 *
	 * @param attribute
	 */
	public getAttributes<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T>[];
	public getAttributes(attribute?: IAttribute<any>) {
		return attributes.getFromParameter(this.method.prototype, this.method.name, this.index, attribute!);
	}

	/**
	 * Returns the last attribute of the specified type on the parameter.
	 *
	 * @param attribute
	 */
	public getAttribute<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T> | undefined {
		return attributes.getFromParameter(this.method.prototype, this.method.name, this.index, attribute).shift();
	}

	/**
	 * Returns true if the parameter has an attribute of the specified type.
	 *
	 * @param attribute
	 */
	public hasAttribute<T extends IAttribute<any>>(attribute: T) {
		return attributes.hasFromParameter(this.method.prototype, this.method.name, this.index, attribute);
	}

	/**
	 * Returns the metadata map for this parameter or `undefined` if there is no metadata for this parameter.
	 *
	 * @returns
	 */
	private getMetadataMap(): Map<any, any> {
		let params = this._method.getMetadata('reflection:params');

		if (params === undefined) {
			params = [];
			this._method.setMetadata('reflection:params', params);
		}

		if (!(this.index in params)) {
			params[this.index] = new Map();
		}

		return params[this.index];
	}

	/**
	 * Returns the value of metadata for the parameter under the specified key.
	 *
	 * @param name
	 * @returns
	 */
	public getMetadata<T = any>(name: any): T | undefined {
		return this.getMetadataMap().get(name);
	}

	/**
	 * Returns an object of all metadata on this parameter.
	 */
	public getAllMetadata(): Record<any, any> {
		const map = this.getMetadataMap();

		const keys = map.keys();
		const result = new Map<any, any>();

		for (const key of keys) {
			result.set(key, map.get(key));
		}

		return result;
	}

	/**
	 * Sets the value of metadata for the parameter under the specified key.
	 *
	 * @param name The metadata key.
	 * @param value The metadata value.
	 */
	public setMetadata(name: any, value: any) {
		this.getMetadataMap().set(name, value);
	}

	/**
	 * Returns `true` if there is metadata with the given name on this parameter.
	 *
	 * @param name The metadata key.
	 */
	public hasMetadata(name: any) {
		return this.getMetadataMap().has(name);
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
			index: this.index,
			name: this.name,
			type: this.getType(),
			typeString: this.getTypeString(),
			isPrimitiveType: this.isPrimitiveType,
			isClassType: this.isClassType,
			isKnownType: this.isKnownType,
			isReflectableType: this.isReflectableType,
			hasDefault: this.hasDefault,
			metadata: Object.assign({}, ...[...this.getAllMetadata().entries()].map(([k, v]) => ({[k]: v}))),
			attributes: this.getAttributes()
		};
	}

}
