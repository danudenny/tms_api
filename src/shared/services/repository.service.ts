import { AttachmentTms } from '../orm-entity/attachment-tms';
import { Awb } from '../orm-entity/awb';
import { AwbItem } from '../orm-entity/awb-item';
import { AwbItemAttr } from '../orm-entity/awb-item-attr';
import { BagItem } from '../orm-entity/bag-item';
import { Branch } from '../orm-entity/branch';
import { Customer } from '../orm-entity/customer';
import { DoPod } from '../orm-entity/do-pod';
import { DoPodDeliver } from '../orm-entity/do-pod-deliver';
import { Employee } from '../orm-entity/employee';
import { PartnerLogistic } from '../orm-entity/partner-logistic';
import { PodFilter } from '../orm-entity/pod-filter';
import { PodFilterDetail } from '../orm-entity/pod-filter-detail';
import { PodFilterDetailItem } from '../orm-entity/pod-filter-detail-item';
import { Reason } from '../orm-entity/reason';
import { Representative } from '../orm-entity/representative';
import { Role } from '../orm-entity/role';
import { RolePermission } from '../orm-entity/role-permission';
import { User } from '../orm-entity/user';
import { UserRole } from '../orm-entity/user-role';
import { OrionRepositoryService } from './orion-repository.service';
import { AwbStatus } from '../orm-entity/awb-status';
import { Province } from '../orm-entity/province';
import { City } from '../orm-entity/city';
import { District } from '../orm-entity/district';
import { DoReturnMaster } from '../orm-entity/do_return_master';
import { DoReturnAwb } from '../orm-entity/do_return_awb';
import { DoReturnAdmintoCt } from '../orm-entity/do_return_admin_to_ct';
import { DoReturnHistory } from '../orm-entity/do_return_history';
import { DoReturnCtToCollection } from '../orm-entity/do_return_ct_to_collection';
import { DoReturnCollectionToCust } from '../orm-entity/do_return_collection_to_cust';
import { Partner } from '../orm-entity/partner';
import { RolePodManualStatus } from '../orm-entity/role-pod-manual-status';
import { Bagging } from '../orm-entity/bagging';
import { DoSmd } from '../orm-entity/do_smd';

/**
 * For now, we are using getter methods due to repositories would always be defined once imported
 * even TypeORM has not been ready yet
 */
export class RepositoryService {
  static get attachmentTms() {
    return new OrionRepositoryService(AttachmentTms);
  }
  static get awb() {
    return new OrionRepositoryService(Awb);
  }
  static get awbStatus() {
    return new OrionRepositoryService(AwbStatus);
  }
  static get awbItem() {
    return new OrionRepositoryService(AwbItem);
  }
  static get awbItemAttr() {
    return new OrionRepositoryService(AwbItemAttr);
  }
  static get bagItem() {
    return new OrionRepositoryService(BagItem);
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
  static get podFilter() {
    return new OrionRepositoryService(PodFilter);
  }
  static get podFilterDetail() {
    return new OrionRepositoryService(PodFilterDetail);
  }
  static get podFilterDetailItem() {
    return new OrionRepositoryService(PodFilterDetailItem);
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
  static get province() {
    return new OrionRepositoryService(Province);
  }
  static get city() {
    return new OrionRepositoryService(City);
  }
  static get district() {
    return new OrionRepositoryService(District);
  }
  static get doReturnMaster() {
    return new OrionRepositoryService(DoReturnMaster);
  }
  static get doReturnAwb() {
    return new OrionRepositoryService(DoReturnAwb);
  }
  static get doReturnAdmintoCt() {
    return new OrionRepositoryService(DoReturnAdmintoCt);
  }
  static get doReturnHistory() {
    return new OrionRepositoryService(DoReturnHistory);
  }
  static get doReturnCttoCollection() {
    return new OrionRepositoryService(DoReturnCtToCollection);
  }
  static get doReturnCollectiontoCust() {
    return new OrionRepositoryService(DoReturnCollectionToCust);
  }
  static get partner() {
    return new OrionRepositoryService(Partner);
  }
  static get rolePodManualStatus() {
    return new OrionRepositoryService(RolePodManualStatus);
  }
  static get baggingSmd() {
    return new OrionRepositoryService(Bagging);
  }
  static get doSmd() {
    return new OrionRepositoryService(DoSmd);
  }
}
