import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { EntityManager } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodReturnDetail } from '../../../../shared/orm-entity/do-pod-return-detail';

export class DoPodReturnDetailService {
  static async createDoPodReturnDetail(
    doPodReturnId: string,
    awb: AwbItemAttr,
    awbNumber: string,
    transactionManager: EntityManager,
    ) {
    const doPodReturnDetail = DoPodReturnDetail.create();
    doPodReturnDetail.doPodReturnId = doPodReturnId;
    doPodReturnDetail.awbId = awb.awbId;
    doPodReturnDetail.awbItemId = awb.awbItemId;
    doPodReturnDetail.awbNumber = awbNumber;
    doPodReturnDetail.awbStatusIdLast = AWB_STATUS.ANT;
    await transactionManager.insert(DoPodReturnDetail, doPodReturnDetail);
  }

  static async getDoPodReturnDetail(
    doPodReturnDetailId: string,
  ): Promise<any> {

    const repo = new OrionRepositoryService(DoPodReturnDetail, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t2.branch_id', 'branchId'],
    );

    q.innerJoin(e => e.doPodReturn, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.doPodReturnDetailId, w => w.equals(doPodReturnDetailId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const result = await q.exec();
    return result[0];
  }
}
