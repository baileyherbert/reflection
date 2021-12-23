import { IAttribute, IAttributeInstance } from '../attributes/Attribute';
import { attributes } from '../attributes/AttributeRegistry';
import { ReflectionClass } from './ReflectionClass';

// @ts-ignore
const isBrowser: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const customInspectSymbol = isBrowser ? Symbol() : require('util').inspect.custom;

export class ReflectionProperty<T = unknown> {

	/**
	 * The name of the property.
	 */
	public readonly name: string;

	/**
	 * The class this property belongs to.
	 */
	public readonly class: ReflectionClass<T>;

	/**
	 * The prototype that this property's metadata lives in.
	 */
	private _proto: any;

	/**
	 * The `design:type` value from TypeScript when available.
	 */
	private _designType?: any;

	/**
	 * Constructs a new `ReflectionProperty` instance.
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
	}

	/**
	 * Returns `true` if design type information is available for this method.
	 *
	 * TypeScript will not output design information, such as parameter and return types, unless the method has at
	 * least one decorator applied.
	 */
	public get isTyped() {
		return this._designType !== undefined;
	}

	/**
	 * Returns the type that the property accepts. This will not be a reflected object but instead a generic object
	 * like `Function` or `Object`.
	 *
	 * **Note:** Returns `Object` for union types.
	 *
	 * @returns
	 */
	public getType() {
		return this._designType;
	}

	/**
	 * Returns a string representing the property's return type. This will be identical to what `typeof` would return.
	 *
	 * **Note:** Returns `object` for union types.
	 *
	 * @returns
	 */
	public getTypeString() {
		const type = this._designType;

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
	 * Returns all attributes on the property.
	 */
	public getAttributes(): IAttributeInstance<any>[];

	/**
	 * Returns all attributes of the specified type on the property.
	 *
	 * @param attribute
	 */
	public getAttributes<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T>[];
	public getAttributes(attribute?: IAttribute<any>) {
		return attributes.getFromProperty(this._proto, this.name, attribute!);
	}

	/**
	 * Returns the last attribute of the specified type on the property.
	 *
	 * @param attribute
	 */
	public getAttribute<T extends IAttribute<any>>(attribute: T): IAttributeInstance<T> | undefined {
		return attributes.getFromProperty(this._proto, this.name, attribute).shift();
	}

	/**
	 * Returns the value of metadata for the property under the specified key.
	 *
	 * @param name
	 * @returns
	 */
	public getMetadata<T = any>(name: any): T | undefined {
		return Reflect.getMetadata(name, this._proto, this.name);
	}

	/**
	 * Returns an object of all metadata on this property.
	 */
	public getAllMetadata() {
		const keys = Reflect.getMetadataKeys(this._proto, this.name);
		const result = new Map<any, any>();

		for (const key of keys) {
			result.set(key, Reflect.getMetadata(key, this._proto, this.name));
		}

		return result;
	}

	/**
	 * Sets the value of metadata for the property under the specified key.
	 *
	 * @param name The metadata key.
	 * @param value The metadata value.
	 */
	public setMetadata(name: any, value: any) {
		return Reflect.defineMetadata(name, value, this._proto, this.name);
	}

	/**
	 * Returns `true` if there is metadata with the given name on this property.
	 *
	 * @param name The metadata key.
	 */
	public hasMetadata(name: any) {
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
			type: this.getType(),
			typeString: this.getTypeString(),
			metadata: Object.assign({}, ...[...this.getAllMetadata().entries()].map(([k, v]) => ({[k]: v})))
		};
	}

}
