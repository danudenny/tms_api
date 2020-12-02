import { User } from '../orm-entity/user';
import { OrionRepositoryService } from './orion-repository.service';
import { Branch } from '../orm-entity/branch';
import { AwbStatus } from '../orm-entity/awb-status';

export class SharedService {
  constructor() {}

  static async getDataUserEmployee(userId: number): Promise<User> {
    const userhRepository = new OrionRepositoryService(User);
    const q = userhRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.employee);
    q.select({
      userId: true,
      username: true,
      employee: {
        employeeId: true,
        employeeName: true,
      },
    });
    q.where(e => e.userId, w => w.equals(userId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }

  static async getDataBranchCity(branchId: number): Promise<Branch> {
    const branchRepository = new OrionRepositoryService(Branch);
    const q = branchRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.district);
    q.leftJoin(e => e.district.city);

    q.select({
      branchId: true,
      branchCode: true,
      branchName: true,
      districtId: true,
      district: {
        cityId: true,
        city: {
          cityName: true,
        },
      },
    });
    q.where(e => e.branchId, w => w.equals(branchId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }

  static async getDataAwbStatus(awbStatusId: number): Promise<AwbStatus> {
    const awbStatus = await AwbStatus.findOne({
      where: {
        awbStatusId,
        isDeleted: false,
      },
      cache: true,
    });
    return awbStatus;
  }

  // string inject array
  static stringInject(str: string, arr: string[]) {
    if (typeof str !== 'string' || !(arr instanceof Array)) {
        return '';
    }

    return str.replace(/({\d})/g, function(i) {
        return arr[i.replace(/{/, '').replace(/}/, '')];
    });
  }

  static stringInjectObj(str: string, obj: Object) {
    const regex = /:(\w+)/g;
    return str.replace(regex, function(match, p1) {
        return obj[p1] || ':' + p1;
    });
}
}
