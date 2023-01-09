import { createProfileInStorage, deleteProfileInStorage, profileForName } from "/background/Profile.mjs";
import * as web5 from "/background/web5/index.mjs";
import { takeAllMatching } from "/shared/js/Array.mjs";
import { ActionCreateProfile, ActionDeleteProfile, PopupDWNRequestAccess } from "/shared/js/Constants.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";
import { popupStorage } from "/shared/js/Storage.mjs";
import { getHost } from "/shared/js/URL.mjs";

/**
 * Handles messages from the API injected into the page.
 * @param {Object} message - The message object sent from the page.
 * @param {string} message.id - The identifier of the message.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 * @param {Object} sender - The web extension API object representing the sender of the message.
 */
async function handleWeb5Message({ id, name, args }, sender) {
	const routes = {
		"web5.dwn.processMessage": web5.dwn.processMessage,
		"web5.dwn.requestAccess": web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	routes[name].handleWeb5Message(id, args, getHost(sender.url), sender.tab.windowId, sender.tab.id, sender.frameId, sender.documentId);
}

/**
 * Handles messages from popups created by API calls.
 * @param {Object} message - The message object sent from the popup.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 * @param {Object} sender - The web extension API object representing the sender of the message.
 */
async function handlePopupMessage({ name, args }, sender) {
	const routes = {
		[PopupDWNRequestAccess]: web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	let matching = [ ];
	await popupStorage.update((popups) => {
		matching = takeAllMatching(popups, (popup) => popup.popupId === sender.tab.windowId);
		return popups;
	});
	if (matching.length === 0)
		return;

	let result = await routes[name].handlePopupMessage(args);

	for (let popup of matching)
		sendToContentScript(popup.tabId, popup.frameId, popup.documentId, popup.messageId, result);

	browser.windows.remove(sender.tab.windowId);
}

/**
 * Handles messages from extension pages.
 * @param {Object} message - The message object sent from the extension page.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 */
async function handleActionMessage({ name, args }) {
	switch (name) {
	case ActionCreateProfile:
		createProfileInStorage(args.name);
		return;

	case ActionDeleteProfile:
		deleteProfileInStorage(args.did);
		return;
	}
}

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
		for (let messageKey of [ "profile_personal_name", "profile_social_name", "profile_work_name" ])
			createProfileInStorage(browser.i18n.getMessage(messageKey));
	}
});

browser.runtime.onMessage.addListener((message, sender) => {
	handleWeb5Message(message, sender);
	handlePopupMessage(message, sender);
	handleActionMessage(message);
});

browser.action.onClicked.addListener(() => {
	browser.runtime.openOptionsPage();
});
