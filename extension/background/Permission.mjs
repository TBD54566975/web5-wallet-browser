import { removeAllMatching } from "/shared/js/Array.mjs";
import { permissionExists } from "/shared/js/Permission.mjs";
import { permissionsStorage } from "/shared/js/Storage.mjs";

export * from "/shared/js/Permission.mjs";

/**
 * Creates a permission object.
 * @param {string} host - The host of the permission.
 * @param {string} did - The DID of the permission.
 * @param {boolean} isAllowed - Whether access is allowed.
 * @return {Object}
 */
async function createPermission(host, did, isAllowed) {
	return { host, did, isAllowed };
}

/**
 * Creates a permission object inside `permissionsStorage`.
 * @param {string} host - The host of the permission.
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

/**
 * Deletes a permission object inside `permissionsStorage`.
 * @param {string} host - The host of the permission.
 * @param {string} did - The DID of the permission.
 * @return {Promise}
 */
export async function deletePermissionInStorage(host, did) {
	return permissionsStorage.update(async (permissions) => {
		removeAllMatching(permissions, (permission) => permission.host === host && permission.did === did);
		return permissions;
	});
}

/**
 * Updates a permission object inside `permissionsStorage`.
 * @param {string} host - The host of the permission.
 * @param {string} did - The DID of the permission.
 * @param {boolean} isAllowed - Whether access is allowed.
 * @return {Promise}
 */
export async function updatePermissionInStorage(host, did, isAllowed) {
	return permissionsStorage.update(async (permissions) => {
		for (let permission of permissions) {
			if (permission.host === host && permission.did === did)
				permission.isAllowed = isAllowed;
		}
		return permissions;
	});
}
