import { permissionExists } from "/shared/js/Permission.mjs";
import { permissionsStorage } from "/shared/js/Storage.mjs";

export * from "/shared/js/Permission.mjs";

/**
 * Creates a permission object.
 * @param {string} name - The name of the permission.
 * @param {string} did - The DID of the permission.
 * @param {boolean} isAllowed - Whether access is allowed.
 * @return {Object}
 */
async function createPermission(host, did, isAllowed) {
	return { host, did, isAllowed };
}

/**
 * Creates a permission object inside `permissionsStorage`.
 * @param {string} name - The name of the permission.
 * @param {string} did - The DID of the permission.
 * @param {boolean} isAllowed - Whether access is allowed.
 * @return {Promise}
 */
export async function createPermissionInStorage(host, did, isAllowed) {
	return permissionsStorage.update(async (permissions) => {
		let permission = await createPermission(host, did, isAllowed);
		if (!permissionExists(permissions, permission))
			permissions.push(permission);
		return permissions;
	});
}
