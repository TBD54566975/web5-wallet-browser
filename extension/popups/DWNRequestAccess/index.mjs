import { PopupDWNRequestAccess } from "/shared/js/Constants.mjs";
import { browser, localizeHTML, sendToBackgroundScript } from "/shared/js/Extension.mjs";
import { removeChildren } from "/shared/js/HTML.mjs";
import { profilesStorage } from "/shared/js/Storage.mjs";
import { substitute } from "/shared/js/String.mjs";

localizeHTML();

let url = new URL(location.href);
let host = url.searchParams.get("host");

let hostElement = document.createElement("strong");
hostElement.textContent = host;

let descriptionElement = document.getElementById("description");
removeChildren(descriptionElement);
substitute(browser.i18n.getMessage("DWNRequestAccess_description"), { host: hostElement }, (item) => {
	descriptionElement.append(item);
});

let profileSelectElement = document.getElementById("profile");
profilesStorage.watch((profiles) => {
	profileSelectElement.parentElement.hidden = profiles.length === 0;

	removeChildren(profileSelectElement);
	for (let profile of profiles) {
		let profileOptionElement = profileSelectElement.appendChild(document.createElement("option"));
		profileOptionElement.textContent = profile.name;
		profileOptionElement.value = profile.did;
		if (profile.default)
			profileOptionElement.selected = true;
	}
});

document.getElementById("allow").addEventListener("click", (event) => {
	sendToBackgroundScript(PopupDWNRequestAccess, {
		host,
		did: profileSelectElement.value,
		isAllowed: true,
	});
});

document.getElementById("deny").addEventListener("click", (event) => {
	sendToBackgroundScript(PopupDWNRequestAccess, {
		host,
		did: profileSelectElement.value,
		isAllowed: false,
	});
});
