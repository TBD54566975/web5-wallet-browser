import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

esbuild.build({
	entryPoints: [ "./background.mjs" ],
	outfile: "../extension/external/background.mjs",
	platform: "browser",
	format: "esm",
	bundle: true,
	minify: true,
	plugins: [
		NodeGlobalsPolyfillPlugin(),
		NodeModulesPolyfillPlugin(),
	],
});
