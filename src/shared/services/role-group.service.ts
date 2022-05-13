import { ConfigService } from "./config.service";

export class RoleGroupService {

  /**
   * Handle role COD merge
   * must not isHeadOffice
   * @static
   * @param {number} roleId
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static isRoleCodMerge(roleId: number, isHeadOffice: boolean): boolean {
    const codRole = ConfigService.get('codRoleId');
    const arrMerge = codRole.codMerge;

    if (arrMerge.includes(Number(roleId)) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handle role COD Admin
   * must not isHeadOffice
   * @static
   * @param {number} roleId
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static isRoleCodAdmin(roleId: number, isHeadOffice: boolean): boolean {
    const codRole = ConfigService.get('codRoleId');
    const arrAdmin = codRole.codAdmin;

    if (arrAdmin.includes(Number(roleId)) && !isHeadOffice) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handle role Web COD manual
   * must not isHeadOffice
   * @static
   * @param {number} roleId
   * @param {boolean} isHeadOffice
   * @returns {boolean}
   * @memberof RoleGroupService
   */
  public static isRoleCodManual(roleId: number, isHeadOffice: boolean): boolean {
    const codRole = ConfigService.get('codRoleId');
    const arrAdmin = codRole.codManual;

    if (arrAdmin.includes(Number(roleId))) {
      return true;
    } else {
      return false;
    }
  }
}
