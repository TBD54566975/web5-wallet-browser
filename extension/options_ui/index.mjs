import { localizeHTML } from "/shared/js/Extension.mjs";

localizeHTML();

let navElement = document.querySelector("nav");
let mainElement = document.querySelector("main");

/**
 * Changes what child of `<nav>` is "selected" and `<main>` is not hidden based on the current URL hash.
 */
function changeView() {
	let hash = location.hash || "#Profiles";
	let id = hash.slice(1);

	for (let child of navElement.children) {
		let selected = child.getAttribute("href") === hash;
		child.classList.toggle("bg-yellow-500", selected);
		child.classList.toggle("hover:bg-yellow-400", !selected);
		child.classList.toggle("hover:text-black", !selected);
	}

	for (let child of mainElement.children)
		child.hidden = true;
	document.getElementById(id).hidden = false;

	import(`/options_ui/${id}.mjs`);
}
window.addEventListener("hashchange", changeView);
changeView();

