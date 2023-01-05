import { CollectionsQuery, CollectionsWrite, generateDWNSignature, getDWN } from "/background/DWN.mjs";
import { permissionForHost } from "/background/Permission.mjs";
import { profileForDID } from "/background/Profile.mjs";
import { sendToContentScript } from "/shared/js/Extension.mjs";
import { permissionsStorage, profilesStorage } from "/shared/js/Storage.mjs";

/**
 * Handler for calls to `web5.dwn.processMessage`.
 * @param {string} messageId - The identifier of the API call.
 * @param {Object} args - The arguments of the API call.
 * @param {Object} args.message - The message to apply to the user's DWN.
 * @param {"CollectionsQuery"|"CollectionsWrite"} args.message.method - The method to apply.
 * @param {*} [args.message.data] - The data to use with the given `method`.
 * @param {Object} [args.message.options] - Additional options for the given `method`.
 * @param {"application/json"} [args.message.options.dataFormat] - The format of the given `data`.  Required if `data` is given.
 * @param {string} host - The host of the context calling the API.
 * @param {number} windowId - The identifier of the window calling the API.
 * @param {number} tabId - The identifier of the tab calling the API.
 * @param {number} frameId - The identifier of the frame calling the API.
 * @param {string} documentId - The identifier of the document calling the API.
 */
export async function handleAPI(messageId, { message }, host, windowId, tabId, frameId, documentId) {
	let permissions = await permissionsStorage.get();
	let permission = permissionForHost(permissions, host);
	if (!permission?.isAllowed) {
		sendToContentScript(tabId, frameId, documentId, messageId, new Error("ACCESS_FORBIDDEN"));
		return;
	}

	switch (message["method"]) {
	case "CollectionsQuery": {
		let profiles = await profilesStorage.get();
		let profile = profileForDID(profiles, permission.did);

		let collectionsQuery = await CollectionsQuery.create({
			...(message["options"] ?? { }),
			target: profile.did,
			signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
		});

		let dwn = await getDWN();
		let result = await dwn.processMessage(collectionsQuery.toJSON());
		sendToContentScript(tabId, frameId, documentId, messageId, result);
		return;
	}

	case "CollectionsWrite": {
		if (message["data"]) {
			switch (message["options"]["dataFormat"]) {
			case "application/json":
				message["options"]["data"] = (new TextEncoder).encode(JSON.stringify(message["data"]));
				break;

			default:
				sendToContentScript(tabId, frameId, documentId, messageId, new Error("UNKNOWN_DATAFORMAT"));
				return;
			}
		}

		let profiles = await profilesStorage.get();
		let profile = profileForDID(profiles, permission.did);

		let collectionsWrite = await CollectionsWrite.create({
			...(message["options"] ?? { }),
			target: profile.did,
			signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
		});

		let dwn = await getDWN();
		let result = await dwn.processMessage(collectionsWrite.toJSON());
		sendToContentScript(tabId, frameId, documentId, messageId, {
			record: collectionsWrite.toJSON(),
			result,
		});
		return;
	}

	default:
		sendToContentScript(tabId, frameId, documentId, messageId, new Error("UNKNOWN_METHOD"));
		return;
	}
}
