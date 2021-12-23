import { Attribute, AttributeClassEvent, AttributeMethodEvent, AttributeParameterEvent, AttributePropertyEvent } from '../../../src/main';

export class TestAttributeImpl extends Attribute {
	public type = 'none';
	public event: any;

	public constructor(private value: number) {
		super();
	}

	public getValue() {
		return this.value;
	}

	public override onClass(event: AttributeClassEvent<Object>) {
		this.type = 'class';
		this.event = event;
	}

	public override onMethod(event: AttributeMethodEvent<Object>) {
		this.type = 'method';
		this.event = event;
	}

	public override onParameter(event: AttributeParameterEvent<Object>) {
		this.type = 'parameter';
		this.event = event;
	}

	public override onProperty(event: AttributePropertyEvent<Object>) {
		this.type = 'property';
		this.event = event;
	}
}

export const TestAttribute = Attribute.create(TestAttributeImpl);
