import { browser } from "/shared/js/Extension.mjs";
import { getHost } from "/shared/js/URL.mjs";

/**
 * Handles messages from the API injected into the page.
 * @param {Object} message - The message object sent from the page.
 * @param {string} message.id - The identifier of the message.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 * @param {Object} sender - The web extension API object representing the sender of the message.
 */
async function handleAPI({ id, name, args }, sender) {
	const routes = {
	};

	if (!(name in routes))
		return;

	routes[name].handleAPI(id, args, getHost(sender.url), sender.tab.windowId, sender.tab.id, sender.frameId, sender.documentId);
}

browser.runtime.onMessage.addListener((message, sender) => {
	handleAPI(message, sender);
});
