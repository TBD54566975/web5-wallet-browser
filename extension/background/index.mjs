import * as web5 from "/background/web5/index.mjs";
import { removeAllMatching, takeFirstMatching } from "/shared/js/Array.mjs";
import { ActionCreateProfile, ActionDeleteProfile, PopupDWNRequestAccess } from "/shared/js/Constants.mjs";
import { generateDID } from "/shared/js/DID.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";
import { createProfile, profileForName } from "/shared/js/Profile.mjs";
import { popupStorage, profilesStorage } from "/shared/js/Storage.mjs";
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
		"web5.dwn.processMessage": web5.dwn.processMessage,
		"web5.dwn.requestAccess": web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	routes[name].handleAPI(id, args, getHost(sender.url), sender.tab.windowId, sender.tab.id, sender.frameId, sender.documentId);
}

/**
 * Handles messages from popups created by API calls.
 * @param {Object} message - The message object sent from the popup.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 * @param {Object} sender - The web extension API object representing the sender of the message.
 */
async function handlePopup({ name, args }, sender) {
	const routes = {
		[PopupDWNRequestAccess]: web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	let popup = null;
	await popupStorage.update((popups) => {
		popup = takeFirstMatching(popups, (popup) => popup.popupId === sender.tab.windowId);
		return popups;
	});
	if (!popup)
		return;

	let result = await routes[name].handlePopup(args);

	await sendToContentScript(popup.tabId, popup.frameId, popup.documentId, popup.messageId, result);

	browser.windows.remove(popup.popupId);
}

/**
 * Handles messages from the options page.
 * @param {Object} message - The message object sent from the popup.
 * @param {string} message.name - The name of the message.
 * @param {Object} message.args - The arguments for the message.
 */
async function handleAction({ name, args }) {
	switch (name) {
	case ActionCreateProfile:
		createProfileInStorage(args.name);
		return;

	case ActionDeleteProfile:
		deleteProfileInStorage(args.did);
		return;
	}
}

/**
 * Creates a profile object inside `profilesStorage`.
 * @param {string} name - The name of the profile to create.
 * @return {Promise}
 */
async function createProfileInStorage(name) {
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
 * @param {string} did - The did of the profile to delete.
 * @return {Promise}
 */
async function deleteProfileInStorage(did) {
	return profilesStorage.update(async (profiles) => {
		removeAllMatching(profiles, (profile) => profile.did === did);
		return profiles;
	});
}

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
		profilesStorage.update(async (profiles) => {
			for (let messageKey of [ "profile_personal_name", "profile_social_name", "profile_work_name" ])
				await createProfileInStorage(browser.i18n.getMessage(messageKey));
			return profiles;
		});
	}
});

browser.runtime.onMessage.addListener((message, sender) => {
	handleAPI(message, sender);
	handlePopup(message, sender);
	handleAction(message);
});

browser.action.onClicked.addListener(() => {
	browser.runtime.openOptionsPage();
});
