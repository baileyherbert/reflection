import { Reflectable } from '../../src/main';

@Reflectable
export class ParentClass {

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
