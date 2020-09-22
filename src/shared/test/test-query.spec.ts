import { createQueryBuilder } from 'typeorm';
import { RedisService } from '../services/redis.service';
import { sleep } from 'sleep-ts';
import { OrionRepositoryService } from '../services/orion-repository.service';
import { CodBankStatement } from '../orm-entity/cod-bank-statement';
import { CodTransaction } from '../orm-entity/cod-transaction';
import { CodTransactionDetail } from '../orm-entity/cod-transaction-detail';
import { CodSupplierInvoice } from '../orm-entity/cod-supplier-invoice';
import { AwbItemAttr } from '../orm-entity/awb-item-attr';

describe('Test Func', () => {
  it('Redis testing', async () => {
    let locking = await RedisService.redlock(`hold:trackingnote:sync`);
    console.log('$$$$$$$ LOCKING :: 1 ', locking);
    await sleep(4000);
    locking = await RedisService.redlock(`hold:trackingnote:sync`);
    console.log(' $$$$$$$ LOCKING :: 2', locking);
    await sleep(1000);
    locking = await RedisService.redlock(`hold:trackingnote:sync`);
    console.log(' $$$$$$$ LOCKING :: 3', locking);

    return true;
  });

  it('Test Raw Query', async () => {
    // #region
    // const hari = moment('2020-05-06 10:00:00').toISOString();
    // const hari2 = moment().toLocaleString();
    // 000400265304
    // const data = await DoPodDeliverDetail.findOne({
    //   awbNumber: '000400265304',
    // });
    // if (data) {
    //   const geog = '-6.2104491,106.8262628';

    //   await DoPodDeliverDetail.update({
    //     awbNumber: '000400265304',
    //   }, {
    //     geog,
    //   });
    //   console.log('########### ', geog);
    // }

    // interface IPoint {
    //   x: number;
    //   y: number;
    // }

    // if (typeof data.geog == 'object') {
    //   const xy: IPoint = data.geog;
    //   console.log(typeof xy.x);
    //   console.log(xy.y);
    // } else {
    //   console.log('ELSE');
    // }
    // #endregion

    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.updated_time', 'transactionDate'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t1.awb_status_id_final', 'awbStatusIdFinal'],
      ['t7.awb_status_title', 'awbStatusLast'],
      ['t1.branch_id_last', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t3.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`t8.cod_payment_method`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t9.created_time', 'pickupRequestTime'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDeliverDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDeliverDetail.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(
      e => e.doPodDeliverDetail.codPayment.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.transactionStatusId, w => w.isNull());
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(
      e => e.awbStatusIdFinal,
      w => w.equals(30000),
    );

    q.take(10);
    const data = await q.exec();
    console.log('######## DATA :: ', data);
    return true;
  });
});
