/**
 * Removes all child nodes from the given container node.
 * @return {ContainerNode} container - The container node.
 */
export function removeChildren(container) {
	container.textContent = "";
}
