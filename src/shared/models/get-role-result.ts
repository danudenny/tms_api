export class UserRoleResponse {
  roleId: number;
  roleName: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  isHeadOffice: boolean;
}

export class GetRoleResult {
  clientId: string;
  userId: number;
  email: string;
  username: string;
  displayName: string;
  roles: UserRoleResponse[];
}
