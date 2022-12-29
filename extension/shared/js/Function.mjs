/**
 * @callback onceCallback
 * @return {*}
 */
/**
 * Saves the result of calling the function so it doesn't have to be called again.
 * @param {onceCallback} callback - The function.
 * @return {Function}
 */
export function once(callback) {
	let result = undefined;
	return function() {
		result ??= callback();
		return result;
	};
}
