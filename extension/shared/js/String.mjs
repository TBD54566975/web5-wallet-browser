/**
 * @callback combineCallback
 * @param {*} value - The value.
 */
/**
 * Replaces (sub)strings delimited by `%`.
 * @param {string} template - The string.
 * @param {Object} substitutions - A map of substitutions.
 * @param {combineCallback} combine - Called for each (sub)string or value in `substitutions`.
 */
 export function substitute(template, substitutions, combine) {
	let substitute = false;
	for (let part of template.split(/(%)(.+?)(%)/)) {
		if (part === "%")
			substitute = !substitute;
		else if (substitute)
			combine(substitutions[part]);
		else
			combine(part);
	}
}
