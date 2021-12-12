import { Meta, Reflectable } from '../../src/main';

@Reflectable
export class ParentClass {

	@Meta.Property('parent_test', 'propC')
	public propC: string = 'Hello world!';

	@Reflectable
	public overloadedMethod(): number {
		return 10;
	}

	@Reflectable
	public parentMethod(): string {
		return 'This method is implemented by the parent';
	}

	public nonReflectableParentMethod() {
		return;
	}

	public static parentStaticMethod() {

	}

}
