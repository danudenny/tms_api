import { Awb } from '../orm-entity/awb';
import { AwbItem } from '../orm-entity/awb-item';
import { Branch } from '../orm-entity/branch';
import { Customer } from '../orm-entity/customer';
import { DoPod } from '../orm-entity/do-pod';
import { DoPodDeliver } from '../orm-entity/do-pod-deliver';
import { Employee } from '../orm-entity/employee';
import { PartnerLogistic } from '../orm-entity/partner-logistic';
import { Reason } from '../orm-entity/reason';
import { Representative } from '../orm-entity/representative';
import { Role } from '../orm-entity/role';
import { RolePermission } from '../orm-entity/role-permission';
import { User } from '../orm-entity/user';
import { UserRole } from '../orm-entity/user-role';
import { OrionRepositoryService } from './orion-repository.service';

/**
 * For now, we are using getter methods due to repositories would always be defined once imported
 * even TypeORM has not been ready yet
 */
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
  static get customer() {
    return new OrionRepositoryService(Customer);
  }
  static get doPod() {
    return new OrionRepositoryService(DoPod);
  }
  static get doPodDeliver() {
    return new OrionRepositoryService(DoPodDeliver);
  }
  static get employee() {
    return new OrionRepositoryService(Employee);
  }
  static get partnerLogistic() {
    return new OrionRepositoryService(PartnerLogistic);
  }
  static get reason() {
    return new OrionRepositoryService(Reason);
  }
  static get representative() {
    return new OrionRepositoryService(Representative);
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
