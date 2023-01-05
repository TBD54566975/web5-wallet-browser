import { browser } from "/shared/js/Extension.mjs";
import { createProfile, profileForName } from "/shared/js/Profile.mjs";
import { profilesStorage } from "/shared/js/Storage.mjs";
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

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
		profilesStorage.update(async (profiles) => {
			for (let messageKey of [ "profile_personal_name", "profile_social_name", "profile_work_name" ]) {
				let name = browser.i18n.getMessage(messageKey);
				if (profileForName(profiles, name))
					continue;

				let profile = await createProfile(name);
				profiles.push(profile);
			}
			return profiles;
		});
	}
});

browser.runtime.onMessage.addListener((message, sender) => {
	handleAPI(message, sender);
});
