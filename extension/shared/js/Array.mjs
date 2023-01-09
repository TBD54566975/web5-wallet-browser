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
 * @callback takeAllMatchingCallback
 * @param {*} item - The item.
 * @param {number} index - The index of the item in the array.
 * @param {Array} array - The array.
 * @return {boolean}
 */
/**
 * Takes all items from the array where the predicate returns true.
 * @param {Array} array - The array.
 * @param {takeAllMatchingCallback} predicate - Called for each item.
 * @return {Array}
 */
export function takeAllMatching(array, predicate) {
	let removed = [ ];
	for (let i = 0; i < array.length; ++i) {
		let item = array[i];
		if (predicate(item, i, array)) {
			array.splice(i--, 1);
			removed.push(item);
		}
	}
	return removed;
}
