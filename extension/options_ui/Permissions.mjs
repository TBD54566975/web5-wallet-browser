import { ActionChangePermission, ActionDeletePermission } from "/shared/js/Constants.mjs";
import { browser, sendToBackgroundScript } from "/shared/js/Extension.mjs";
import { removeChildren } from "/shared/js/HTML.mjs";
import { profileForDID } from "/shared/js/Profile.mjs";
import { permissionsStorage, profilesStorage } from "/shared/js/Storage.mjs";

let permissionsTable = document.querySelector("#Permissions table tbody");

let permissionsRowTemplate = permissionsTable.firstElementChild;
permissionsRowTemplate.remove();

permissionsStorage.watch(async (permissions) => {
	let profiles = await profilesStorage.get();

	removeChildren(permissionsTable);
	for (let permission of permissions) {
		let rowElement = permissionsRowTemplate.content.cloneNode(true);

		let profileText = rowElement.querySelector("[data-value=profile] span");
		profileText.textContent = profileForDID(profiles, permission.did).name;

		let profileButton = rowElement.querySelector("[data-value=profile] svg");
		profileButton.addEventListener("click", (event) => {
			navigator.clipboard.writeText(permission.did);
		});

		let hostText = rowElement.querySelector("[data-value=host] span");
		hostText.textContent = permission.host;

		let accessCheckbox = rowElement.querySelector("[data-value=access] input[type=checkbox]");
		accessCheckbox.checked = permission.isAllowed;
		accessCheckbox.addEventListener("change", (event) => {
			sendToBackgroundScript(ActionChangePermission, {
				host: permission.host,
				did: permission.did,
				isAllowed: accessCheckbox.checked,
			});
		})

		let deleteText = rowElement.querySelector("[data-value=delete] span");
		deleteText.textContent = browser.i18n.getMessage("options_Profiles_table_Delete_button");

		let deleteButton = rowElement.querySelector("[data-value=delete] svg");
		deleteButton.addEventListener("click", (event) => {
			sendToBackgroundScript(ActionDeletePermission, {
				host: permission.host,
				did: permission.did,
			});
		});

		permissionsTable.appendChild(rowElement);
	}
});
