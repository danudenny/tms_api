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
}
