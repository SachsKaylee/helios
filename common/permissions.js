/**
 * All permissions in the CMS.
 */
const permissions = {
  /**
   * The user is admin: allowed to do everything & more than other permissions like manage users.
   */
  admin: "admin",
  /**
   * The user can manage posts.
   */
  post: "post",
  /**
   * The user can manage pages.
   */
  page: "page",
  /**
   * The user can manage blog subscribers.
   */
  subscriber: "subscriber",
  /**
   * The user can manage files.
   */
  file: "file"
};

/**
 * Checks if the given permissions are valid permissions.
 * @param {string[]} permissionList The list of permission IDs.
 * @param {boolean} allowAdmin Is "admin" considered valid? false by default. If true ONLY admin is valid.
 */
const areValidPermissions = (permissionList, allowAdmin = false) => {
  // Admins may only have a single admin permission.
  if (allowAdmin && permissionList.length !== 1) {
    return false;
  }
  for (const permission of permissionList) {
    if (permission === permissions.admin) {
      // Normal users may not have the admin permissions.
      if (!allowAdmin) {
        return false;
      }
    } else if (permissions[permission]) {
      // Admins may not have normal permissions.
      if (allowAdmin) {
        return false;
      }
    } else {
      // The permission does not exist.
      return false;
    }
  }
  return true;
};

module.exports = {
  permissions,
  areValidPermissions
}
