import { base58btc, base64url, ed25519, getPublicKey, varint } from "/external/bundle.mjs";

const ED25519_CODEC_ID = varint(parseInt("0xed", 16));

/**
 * Generates a DID.
 * @return {Object}
 */
export async function generateDID() {
	let privateKeyBytes = ed25519.randomPrivateKey();
	let publicKeyBytes = await getPublicKey(privateKeyBytes);

	let idBytes = new Uint8Array(publicKeyBytes.byteLength + ED25519_CODEC_ID.length);
	idBytes.set(ED25519_CODEC_ID, 0);
	idBytes.set(publicKeyBytes, ED25519_CODEC_ID.length);

	let id = base58btc.encode(idBytes);
	let did = `did:key:${id}`;
	let keyId = `${did}#${id}`;
	let publicJWK = {
		alg: "EdDSA",
		crv: "Ed25519",
		kid: keyId,
		kty: "OKP",
		use: "sig",
		x: base64url.baseEncode(publicKeyBytes)
	};
	let privateJWK = {
		...publicJWK,
		d: base64url.baseEncode(privateKeyBytes),
	};
	return { did, publicJWK, privateJWK };
}

/**
 * Parses a DID into its components.
 * @param {string} did - The DID.
 * @return {Object}
 */
export function parseDID(did) {
	let [ scheme, method, id ] = did.split(":");
	return { scheme, method, id };
}
