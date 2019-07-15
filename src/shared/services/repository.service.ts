import { Awb } from '../orm-entity/awb';
import { AwbItem } from '../orm-entity/awb-item';
import { Branch } from '../orm-entity/branch';
import { Role } from '../orm-entity/role';
import { RolePermission } from '../orm-entity/role-permission';
import { User } from '../orm-entity/user';
import { UserRole } from '../orm-entity/user-role';
import { OrionRepositoryService } from './orion-repository.service';

export class RepositoryService {
  static awb = new OrionRepositoryService(Awb);
  static awbItem = new OrionRepositoryService(AwbItem);
  static branch = new OrionRepositoryService(Branch);
  static role = new OrionRepositoryService(Role);
  static rolePermission = new OrionRepositoryService(RolePermission);
  static user = new OrionRepositoryService(User);
  static userRole = new OrionRepositoryService(UserRole);
}
