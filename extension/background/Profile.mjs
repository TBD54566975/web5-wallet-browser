import { generateDID } from "/background/DID.mjs";
import { removeAllMatching } from "/shared/js/Array.mjs";
import { profileForName } from "/shared/js/Profile.mjs";
import { profilesStorage } from "/shared/js/Storage.mjs";

export * from "/shared/js/Profile.mjs";

/**
 * Creates a profile object.
 * @param {string} name - The name of the profile.
 * @return {Object}
 */
async function createProfile(name) {
	let { did, privateJWK, publicJWK } = await generateDID();
	return {
		did,
		name,
		privateJWK,
		publicJWK,
		date: (new Date).getTime(),
	};
}

/**
 * Creates a profile object inside `profilesStorage`.
 * @param {string} name - The name of the profile.
 * @return {Promise}
 */
export async function createProfileInStorage(name) {
	return profilesStorage.update(async (profiles) => {
		if (!profileForName(profiles, name)) {
			let profile = await createProfile(name);
			profiles.push(profile);
		}
		return profiles;
	});
}

/**
 * Deletes a profile object inside `profilesStorage`.
 * @param {string} did - The DID of the profile.
 * @return {Promise}
 */
export async function deleteProfileInStorage(did) {
	return profilesStorage.update(async (profiles) => {
		removeAllMatching(profiles, (profile) => profile.did === did);
		return profiles;
	});
}
