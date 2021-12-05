/**
 * @internal
 */
export class ParameterParser {

	/**
	 * Parses parameters from the given function string.
	 *
	 * This parser is pretty simple but it should account for all edge cases and correctly parse parameters 100% of
	 * the time, unlike any regex alternatives out there.
	 *
	 * @param input
	 * @returns
	 */
	public static parse(input: string) {
		const params = new Array<ExtractedParameter>();

		let parenthesisDepth = 0;

		let stringActive = false;
		let stringCharacter: string | undefined;
		let stringAllowedCharacters = ['"', "`", `'`];
		let stringEscaped = false;

		let name = '';
		let hasDefault = false;

		const push = () => {
			if (name.length) {
				params.push({
					index: params.length,
					name,
					hasDefault
				});

				name = '';
				hasDefault = false;
			}
		};

		for (let charIndex = 0; charIndex < input.length; charIndex++) {
			const char = input[charIndex];
			const nextChar = input[charIndex + 1];

			// Handle code outside of strings
			if (!stringActive) {
				// Ignore whitespace
				if (/\s/.test(char)) {
					continue;
				}

				// Track opening parenthesis
				if (char === '(') {
					parenthesisDepth += 1;
				}

				// Track closing parenthesis
				else if (char === ')') {
					parenthesisDepth -= 1;

					// Once we go back to 0, we're done with the function's parameters
					if (parenthesisDepth === 0) {
						push();
						break;
					}
				}

				// Skip until we enter the parameters
				if (parenthesisDepth === 0) {
					continue;
				}

				// Handle block comments
				else if (char === '/' && nextChar === '*') {
					const commentEndIndex = input.indexOf('*/', charIndex);

					if (commentEndIndex < 0) {
						throw new Error('Could not find comment end index');
					}

					charIndex = commentEndIndex + 1;
				}

				// Handle line comments
				else if (char === '/' && nextChar === '/') {
					charIndex = input.indexOf('\n', charIndex);
				}

				// Handle strings
				else if (stringAllowedCharacters.indexOf(char) >= 0) {
					stringActive = true;
					stringCharacter = char;
				}

				// Handle equal signs
				else if (char === '=') {
					hasDefault = true;
				}

				// Handle commas
				else if (char === ',') {
					push();
				}

				// Handle parameter names
				else if (!hasDefault) {
					// Handle the first character of a parameter name
					if (/[a-zA-Z_$]/.test(char)) {
						name += char;
					}

					// Handle the rest
					else if (/[a-zA-Z_$0-9]/.test(char)) {
						name += char;
					}
				}
			}

			// Close strings
			else {
				// Track escaping
				if (char === '\\') {
					stringEscaped = !stringEscaped;
				}

				// Skip escaped characters
				else if (stringEscaped) {
					stringEscaped = false;
				}

				// Close string
				else if (char === stringCharacter) {
					stringActive = false;
				}
			}
		}

		return params;
	}

}

/**
 * Represents a parameter that was extracted from a function definition.
 *
 * @internal
 */
export interface ExtractedParameter {
	index: number;
	name: string;
	hasDefault: boolean;
}
