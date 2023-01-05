/**
 * Checks if a matching permission already exists.
 * @param {string} permissions - The permissions.
 * @param {string} permission - The permission.
 * @return {boolean}
 */
export function permissionExists(permissions, permission) {
  return permissions.some((existing) => existing.host === permission.host && existing.did === permission.did);
}

/**
 * Finds the first matching permission.
 * @param {Array} permissions - The permissions.
 * @param {string} host - The host to match.
 * @return {Object}
 */
export function permissionForHost(permissions, host) {
  return permissions.find((permission) => permission.host === host);
}
