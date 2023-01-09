import { removeAllMatching } from "/shared/js/Array.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";
import { popupStorage } from "/shared/js/Storage.mjs";

/**
 * Creates a popup.
 * @param {string} name - The name of the popup (which is used to find the HTML file for it).
 * @param {Object} params - The parameters to encode into the URL of the popup.
 * @param {string} messageId - The identifier of the message creating the popup.
 * @param {number} windowId - The identifier of the window creating the popup.
 * @param {number} tabId - The identifier of the tab creating the popup.
 * @param {number} frameId - The identifier of the frame creating the popup.
 * @param {string} documentId - The identifier of the document creating the popup.
 */
export async function createAPIPopup(name, params, messageId, windowId, tabId, frameId, documentId) {
	let lastFocusedWindow = await browser.windows.get(windowId);

	const width = 459;
	const height = 692;

	let url = new URL(browser.runtime.getURL(`/popups/${name}/index.html`));
	for (let key in params)
		url.searchParams.set(key, params[key]);

	let popup = await browser.windows.create({
		url: url.href,
		type: "popup",
		top: Math.round(lastFocusedWindow.top + (lastFocusedWindow.height / 2) - (height / 2)),
		left: Math.round(lastFocusedWindow.left + (lastFocusedWindow.width / 2) - (width / 2)),
		width,
		height,
		focused: true,
	});

	let popupsToClose = new Set;

	await popupStorage.update(async (popups) => {
		for (let existing of popups) {
			if (existing.url === url.href) {
				popupsToClose.add(existing.popupId);

				existing.popupId = popup.id;
			}
		}

		popups.push({
			url: url.href,
			popupId: popup.id,
			tabId,
			frameId,
			documentId,
			messageId,
		});
		return popups;
	});

	for (let popupId of popupsToClose)
		browser.windows.remove(popupId);
}

browser.tabs.onRemoved.addListener((tabId) => {
	popupStorage.update((popups) => {
		removeAllMatching(popups, (popup) => {
			if (popup.tabId === tabId) {
				browser.windows.remove(popup.popupId);
				return true;
			}

			return false;
		});
		return popups;
	});
});

browser.windows.onRemoved.addListener((windowId) => {
	popupStorage.update((popups) => {
		removeAllMatching(popups, (popup) => {
			if (popup.windowId === windowId) {
				browser.windows.remove(popup.popupId);
				return true;
			}

			if (popup.popupId === windowId) {
				sendToContentScript(popup.tabId, popup.frameId, popup.documentId, popup.messageId, new Error("CANCELLED"));
				return true;
			}

			return false;
		});
		return popups;
	});
});
