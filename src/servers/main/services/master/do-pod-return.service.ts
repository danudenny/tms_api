import moment = require('moment');
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { DoPodReturn } from '../../../../shared/orm-entity/do-pod-return';
import { AuditHistory } from '../../../../shared/orm-entity/audit-history';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';

export class DoPodReturnService {

  static async createDoPodReturn(
    userIdDriver: number,
    desc: string,
    branchId: number,
    userId: number,
    isMobile: boolean,
  ): Promise<DoPodReturn> {
    const doPod = DoPodReturn.create();
    // NOTE: Tipe surat (jalan Antar Retur Sigesit)

    if (isMobile) {
      doPod.doPodReturnCode = await CustomCounterCode.doPodReturnMobile(
        moment().toDate(),
      );
    } else {
      doPod.doPodReturnCode = await CustomCounterCode.doPodReturn(
        moment().toDate(),
      );
    }
    doPod.userIdDriver = userIdDriver || null;
    doPod.doPodReturnDateTime = moment().toDate();
    doPod.doPodReturnDate = moment().toDate();
    doPod.description = desc || null;
    doPod.branchId = branchId;
    doPod.userId = userId;
    doPod.isMobile = isMobile;
    return await DoPodReturn.save(doPod);
  }

  static async getDataById(doPodReturnId: string) {
    const doPodRepository = new OrionRepositoryService(DoPodReturn);
    const q = doPodRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branch);
    q.leftJoin(e => e.userDriver);
    q.leftJoin(e => e.userDriver.employee);

    q.select({
      doPodReturnId: true,
      doPodReturnCode: true,
      totalAwb: true,
      description: true,
      branch: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
      userDriver: {
        userId: true,
        userIdCreated: true,
        employeeId: true,
        firstName: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
      userCreated: {
        userId: true,
        userIdCreated: true,
        employeeId: true,
        firstName: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
    });
    q.where(e => e.doPodReturnId, w => w.equals(doPodReturnId));
    q.andWhere(e => e.isDeleted, w => w.equals(false));
    q.take(1);
    return await q.exec();
  }

  static async byIdCache(doPodReturnId: string): Promise<DoPodReturn> {
    const doPodReturn = await DoPodReturn.findOne(
      { doPodReturnId },
      { cache: true },
    );
    return doPodReturn;
  }

  static async updateTotalAwbById(totalAwb: number, totalSuccess: number, doPodReturnId: string) {
    await DoPodReturn.update({doPodReturnId}, {totalAwb: totalAwb += totalSuccess});
  }

  static async createAuditReturnHistory(
    doPodReturnId: string,
    isUpdate: boolean,
  ) {
    // find doPodReturn
    const doPodReturn = await this.getDataById(
      doPodReturnId,
    );
    if (doPodReturn) {
      // construct note for information
      const description = doPodReturn.description
        ? doPodReturn.description
        : '';
      const stage = isUpdate ? 'Updated' : 'Created';
      const note = `
        Data ${stage} \n
        Nama Driver  : ${doPodReturn.userDriver.employee.employeeName}
        Gerai Assign : ${doPodReturn.branch.branchName}
        Note         : ${description}
      `;
      // create new object AuditHistory
      const auditHistory = AuditHistory.create();
      auditHistory.changeId = doPodReturnId;
      auditHistory.transactionStatusId = 1500; // NOTE: doPodReturn
      auditHistory.note = note;
      return await AuditHistory.save(auditHistory);
    }
  }
}
