import { ActionCreateProfile, ActionDeleteProfile } from "/shared/js/Constants.mjs";
import { browser, sendToBackgroundScript } from "/shared/js/Extension.mjs";
import { removeChildren } from "/shared/js/HTML.mjs";
import { profileForName } from "/shared/js/Profile.mjs";
import { profilesStorage } from "/shared/js/Storage.mjs";

let createIdentityButton = document.querySelector("#Profiles button[data-action=create]");
createIdentityButton.addEventListener("click", (event) => {
	createProfileForm.reset();
	createProfileModal.showModal();

	document.addEventListener("click", function handleClick(event) {
		if (createProfileModal.open && event.target !== createProfileModal)
			return;

		createProfileModal.close();
		document.removeEventListener("click", handleClick);
	});
});

let profilesTable = document.querySelector("#Profiles table tbody");

let profilesRowTemplate = profilesTable.firstElementChild;
profilesRowTemplate.remove();

let createProfileModal = document.querySelector("#Profiles dialog[data-modal=create]");

let createProfileForm = createProfileModal.querySelector("form");
createProfileForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (event.submitter.dataset.action !== "create")
		return;

	let profiles = await profilesStorage.get();

	let createProfileNameInput = createProfileForm.elements.name;
	let name = createProfileNameInput.value;
	if (profileForName(profiles, name)) {
		createProfileNameInput.setCustomValidity(browser.i18n.getMessage("options_Profiles_modal_Name_error"));
		createProfileForm.reportValidity();
		return;
	}

	sendToBackgroundScript(ActionCreateProfile, { name });
	createProfileModal.close();
});

createProfileForm.elements.name.addEventListener("input", (event) => {
	event.target.setCustomValidity("");
});

let closeCreateProfileButton = createProfileModal.querySelector("button[data-action=close]");
closeCreateProfileButton.addEventListener("click", (event) => {
	createProfileModal.close();
});

profilesStorage.watch((profiles) => {
	removeChildren(profilesTable);
	for (let profile of profiles) {
		let rowElement = profilesRowTemplate.content.cloneNode(true);

		let nameText = rowElement.querySelector("[data-value=name] span");
		nameText.textContent = profile.name;

		let didText = rowElement.querySelector("[data-value=did] span");
		didText.textContent = browser.i18n.getMessage("options_Profiles_table_key_cell");

		let didButton = rowElement.querySelector("[data-value=did] svg");
		didButton.addEventListener("click", (event) => {
			navigator.clipboard.writeText(profile.did)
		});

		let dateText = rowElement.querySelector("[data-value=date] span");
		dateText.textContent = profile.date;

		let deleteText = rowElement.querySelector("[data-value=delete] span");
		deleteText.textContent = browser.i18n.getMessage("options_Profiles_table_Delete_button");

		let deleteButton = rowElement.querySelector("[data-value=delete] svg");
		deleteButton.classList.toggle("group-hover:visible", profiles.length > 1);
		deleteButton.addEventListener("click", (event) => {
			sendToBackgroundScript(ActionDeleteProfile, { did: profile.did });
		});

		profilesTable.appendChild(rowElement);
	}
});
