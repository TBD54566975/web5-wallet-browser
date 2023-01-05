/**
 * Finds the first matching profile.
 * @param {Array} profiles - The profiles.
 * @param {string} did - The DID to match.
 * @return {Object}
 */
export function profileForDID(profiles, did) {
  return profiles.find((profile) => profile.did === did);
}

/**
 * Finds the first matching profile.
 * @param {Array} profiles - The profiles.
 * @param {string} name - The name to match.
 * @return {Object}
 */
export function profileForName(profiles, name) {
	return profiles.find((profile) => profile.name === name);
}
