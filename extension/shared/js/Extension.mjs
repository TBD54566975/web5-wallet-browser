export let browser = globalThis.browser ?? globalThis.chrome;

/**
 * Determines whether the current context is the extension background script.
 * @return {boolean}
 */
export function isBackground() {
 return globalThis.serviceWorker?.scriptURL === browser.runtime.getURL("/background/index.mjs");
}

/**
 * Finds all elements with `data-localize` and replaces the value of each property (separated by `,`) with the text of the message with the same key.
 * 
 * @example
 * `<div data-localize="title,textContent=foo" title="bar"></div>` will replace the `title` with the value of the message named `"bar"` and the `textContent` with the value of the message named `"foo"`.
 */
export function localizeHTML() {
	document.body.setAttribute("dir", browser.i18n.getMessage("@@bidi_dir"));

	for (let node of document.querySelectorAll("[data-localize]")) {
		for (let config of node.dataset.localize.split(",")) {
			let [ propertyToLocalize, messageKey ] = config.split("=");
			node[propertyToLocalize] = browser.i18n.getMessage(messageKey || node[propertyToLocalize]);
		}
		delete node.dataset.localize;
	}
}

/**
 * Sends a message to the extension background script.
 * @param {string} name - The name of the message.
 * @param {Object} args - The arguments for the message.
 * @return {Promise}
 */
export function sendToBackgroundScript(name, args) {
	return browser.runtime.sendMessage({ name, args });
}

/**
 * Sends a message to a content script.
 * @param {number} tabId - The identifier of the tab containing the content script.
 * @param {number} frameId - The identifier of the frame containing the content script.
 * @param {string} documentId - The identifier of the document containing the content script.
 * @param {string} messageId - The identifier of the message.
 * @param {Error|*} [value] - The arguments for the message.
 * @return {Promise}
 */
export function sendToContentScript(tabId, frameId, documentId, messageId, value) {
	let message = { id: messageId };

	if (value instanceof Error)
		message.error = value.message;
	else if (value !== undefined)
		message.result = value;

	return browser.tabs.sendMessage(tabId, message, { frameId, documentId });
}
