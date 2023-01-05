/**
 * @callback removeAllMatchingCallback
 * @param {*} item - The item.
 * @param {number} index - The index of the item in the array.
 * @param {Array} array - The array.
 * @return {boolean}
 */
/**
 * Removes all items from the array where the predicate returns true.
 * @param {Array} array - The array.
 * @param {removeAllMatchingCallback} predicate - Called for each item.
 */
export function removeAllMatching(array, predicate) {
	for (let i = 0; i < array.length; ++i) {
		if (predicate(array[i], i, array))
			array.splice(i--, 1);
	}
}

/**
 * @callback takeFirstMatchingCallback
 * @param {*} item - The item.
 * @param {number} index - The index of the item in the array.
 * @param {Array} array - The array.
 * @return {boolean}
 */
/**
 * Removes and returns the first item in the array where the predicate returns true.
 * @param {Array} array - The array.
 * @param {takeFirstMatchingCallback} callback - Called for each item.
 * @return {*}
 */
export function takeFirstMatching(array, predicate) {
	for (let i = 0; i < array.length; ++i) {
		let item = array[i];
		if (predicate(item, i, array)) {
			array.splice(i--, 1);
			return item;
		}
	}
}
