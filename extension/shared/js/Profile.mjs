import { generateDID } from "/shared/js/DID.mjs";

/**
 * Creates a profile object for `profilesStorage`.
 * @param {string} name - The name of the profile.
 * @return {Object}
 */
export async function createProfile(name) {
	let { did, privateJWK, publicJWK } = await generateDID();
	return { did, name, privateJWK, publicJWK };
}

/**
 * Finds the first matching profile.
 * @param {Array} profiles - The profiles.
 * @param {string} did - The did to match.
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
