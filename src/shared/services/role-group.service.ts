
export class RoleGroupService {

  /**
   * Handle role COD merge
   * must not isHeadOffice
   * @static
   * @param {string} roleName
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static roleCodMerge(roleName: string, isHeadOffice: boolean): boolean {
    const arrMerge = [
      'Admin COD - Merger',
      'Ops - Koordinator Sigesit Antar (COD)',
    ];

    if (arrMerge.includes(roleName) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }


  /**
   * Handle role COD Admin
   * must not isHeadOffice
   * @static
   * @param {string} roleName
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static roleCodAdmin(roleName: string, isHeadOffice: boolean): boolean {
    const arrMerge = ['Ops - Admin COD', 'Ops - Admin Operational ( COD )'];

    if (arrMerge.includes(roleName) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }
}
