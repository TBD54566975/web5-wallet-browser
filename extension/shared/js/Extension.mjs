export let browser = globalThis.browser ?? globalThis.chrome;

/**
 * Determines whether the current context is the extension background script.
 * @return {boolean}
 */
export function isBackground() {
 return globalThis.serviceWorker?.scriptURL === browser.runtime.getURL("/background/index.mjs");
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
