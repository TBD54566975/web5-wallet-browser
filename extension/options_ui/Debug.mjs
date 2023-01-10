import { DebugModifyStorage } from "/shared/js/Constants.mjs";
import { sendToBackgroundScript } from "/shared/js/Extension.mjs";
import { permissionsStorage, profilesStorage } from "/shared/js/Storage.mjs";

let profilesTextarea = document.querySelector("#Debug textarea[data-value=profiles]");
profilesTextarea.addEventListener("input", (event) => {
	try {
		sendToBackgroundScript(DebugModifyStorage, {
			key: profilesStorage.key,
			value: profilesTextarea.value.length > 0 ? JSON.parse(profilesTextarea.value) : profilesStorage.fallback,
		});
	} catch { }
});
profilesStorage.watch((profiles) => {
	profilesTextarea.value = JSON.stringify(profiles);
});

let permissionsTextarea = document.querySelector("#Debug textarea[data-value=permissions]");
permissionsTextarea.addEventListener("input", (event) => {
	try {
		sendToBackgroundScript(DebugModifyStorage, {
			key: permissionsStorage.key,
			value: permissionsTextarea.value.length > 0 ? JSON.parse(permissionsTextarea.value) : permissionsStorage.fallback,
		});
	} catch { }
});
permissionsStorage.watch((permissions) => {
	permissionsTextarea.value = JSON.stringify(permissions);
});
