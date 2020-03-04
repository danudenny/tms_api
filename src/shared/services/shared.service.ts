import { User } from '../orm-entity/user';
import { OrionRepositoryService } from './orion-repository.service';
import { Branch } from '../orm-entity/branch';

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
}
