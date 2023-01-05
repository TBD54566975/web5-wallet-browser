/**
 * Parses a DID into its components.
 * @param {string} did - The DID.
 * @return {Object}
 */
export function parseDID(did) {
	let [ scheme, method, id ] = did.split(":");
	return { scheme, method, id };
}
