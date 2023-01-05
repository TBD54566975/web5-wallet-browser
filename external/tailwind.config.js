module.exports = {
	content: [ "../extension/**/*.{html,mjs}" ],
	theme: {
		extend: {
			colors: {
				"tbd-yellow": "#ffec19",
			},
			fontFamily: {
				tbd: [ "IBM Plex Mono", "monospace" ],
			},
			screens: {
				"-md": { max: "767px" },
				"-sm": { max: "639px" },
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
	],
};
