import { parseDID } from "/shared/js/DID.mjs";

/**
 * Generates a DWN signature for use when applying messages.
 * @param {string} did - The DID of the profile applying the message.
 * @param {Object} privateJWK - The private JWK of the profile.
 * @return {Object}
 */
export function generateDWNSignature(did, privateJWK) {
	let { id } = parseDID(did);
	return {
		protectedHeader: {
			alg: privateJWK.alg,
			kid: `${did}#${id}`,
		},
		jwkPrivate: privateJWK,
	};
}
