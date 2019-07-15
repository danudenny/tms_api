import { Awb } from '../orm-entity/awb';
import { AwbItem } from '../orm-entity/awb-item';
import { Branch } from '../orm-entity/branch';
import { Role } from '../orm-entity/role';
import { RolePermission } from '../orm-entity/role-permission';
import { User } from '../orm-entity/user';
import { UserRole } from '../orm-entity/user-role';
import { OrionRepositoryService } from './orion-repository.service';

export class RepositoryService {
  static get awb() {
    return new OrionRepositoryService(Awb);
  }
  static get awbItem() {
    return new OrionRepositoryService(AwbItem);
  }
  static get branch() {
    return new OrionRepositoryService(Branch);
  }
  static get role() {
    return new OrionRepositoryService(Role);
  }
  static get rolePermission() {
    return new OrionRepositoryService(RolePermission);
  }
  static get user() {
    return new OrionRepositoryService(User);
  }
  static get userRole() {
    return new OrionRepositoryService(UserRole);
  }
}
