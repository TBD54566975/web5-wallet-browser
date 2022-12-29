import { createAPIPopup } from "/background/Popup.mjs";
import { PopupDWNRequestAccess } from "/shared/js/Constants.mjs";
import { sendToContentScript } from "/shared/js/Extension.mjs";
import { createPermission, permissionExists, permissionForHost } from "/shared/js/Permission.mjs";
import { permissionsStorage } from "/shared/js/Storage.mjs";

/**
 * Handler for calls to `web5.dwn.requestAccess`.
 * @param {string} messageId - The identifier of the API call.
 * @param {Object} args - The arguments of the API call.
 * @param {string} host - The host of the context calling the API.
 * @param {number} windowId - The identifier of the window calling the API.
 * @param {number} tabId - The identifier of the tab calling the API.
 * @param {number} frameId - The identifier of the frame calling the API.
 * @param {string} documentId - The identifier of the document calling the API.
 */
export async function handleAPI(messageId, { }, host, windowId, tabId, frameId, documentId) {
	let permissions = await permissionsStorage.get();
	let permission = permissionForHost(permissions, host);
	if (permission) {
		sendToContentScript(tabId, frameId, documentId, messageId, { isAllowed: permission.isAllowed });
		return;
	}

	createAPIPopup(PopupDWNRequestAccess, { host }, messageId, windowId, tabId, frameId, documentId);
}

/**
 * Handler for the result of `PopupDWNRequestAccess`.
 * @param {Object} args - The arguments of the API call.
 * @param {string} args.host - The host of the context calling `web5.dwn.requestAccess`.
 * @param {string} args.did - The DID of the profile that was allowed/denied access.
 * @param {string} args.isAllowed - Whether access was allowed or denied.
 */
export async function handlePopup({ host, did, isAllowed }) {
	await permissionsStorage.update(async (permissions) => {
		let permission = await createPermission(host, did, isAllowed);
		if (!permissionExists(permissions, permission))
			permissions.push(permission);
		return permissions;
	});

	return { isAllowed };
}
