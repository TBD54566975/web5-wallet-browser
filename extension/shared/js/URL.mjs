/**
 * Gets the host of a URL
 * @param {URL|string} url - The URL.
 * @returns {string}
 */
export function getHost(url) {
	if (!(url instanceof URL))
		url = new URL(url);
	return url.host;
}
