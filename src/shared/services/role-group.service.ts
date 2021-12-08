
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
  public static isRoleCodMerge(roleName: string, isHeadOffice: boolean): boolean {
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
  public static isRoleCodAdmin(roleName: string, isHeadOffice: boolean): boolean {
    const arrAdmin = ['Ops - Admin COD', 'Ops - Admin Operational ( COD )'];

    if (arrAdmin.includes(roleName) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handle role Web COD manual
   * must not isHeadOffice
   * @static
   * @param {string} roleName
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static isRoleCodManual(roleName: string, isHeadOffice: boolean): boolean {
    const arrAdmin = ['Admin FORCE MAJEURE'];

    if (arrAdmin.includes(roleName) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }
}
