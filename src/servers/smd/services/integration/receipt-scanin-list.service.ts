import { Injectable, Param, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { ScanInSmdDetailResponseVm } from '../../models/scanin-smd-list.response.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import {
  ReceiptScaninListResponseVm,
  ReceiptScaninDetailListResponseVm,
} from '../../models/receipt-scanin-list.response.vm';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';

@Injectable()
export class ReceiptScaninListService {
  static async findReceiptScanInList(
    payload: BaseMetaPayloadVm,
  ): Promise<ReceiptScaninListResponseVm> {
    payload.fieldResolverMap['receivedBagId'] = 'rb.received_bag_id';
    payload.fieldResolverMap['receivedBagCode'] = 'rb.received_bag_code';
    payload.fieldResolverMap['branchId'] = 'b.branch_id';
    payload.fieldResolverMap['branchName'] = 'b.branch_name';
    payload.fieldResolverMap['userId'] = 'u.user_id';
    payload.fieldResolverMap['fullName'] = 'u.first_name';
    payload.fieldResolverMap['receivedBagDate'] = 'rb.received_bag_date';
    payload.fieldResolverMap['totalBagNumber'] = 'rb.total_seq';
    payload.fieldResolverMap['totalBagWeight'] = 'rb.total_bag_weight';

    payload.globalSearchFields = [
      {
        field: 'receivedBagCode',
      },
      {
        field: 'branchName',
      },
      {
        field: 'fullName',
      },
    ];

    const repo = new OrionRepositoryService(ReceivedBag, 'rb');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['rb.received_bag_id', 'receivedBagId'],
      ['rb.received_bag_code', 'receivedBagCode'],
      ['b.branch_id', 'branchId'],
      ['b.branch_name', 'branchName'],
      [`u.user_id`, 'userId'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'fullName'],
      ['rb.received_bag_date', 'receivedBagDate'],
      ['rb.total_seq', 'totalBagNumber'],
      ['rb.total_bag_weight', 'totalBagWeight'],
    );

    q.innerJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.user, 'u', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    if (data) {
      const detailRepo = new OrionRepositoryService(ReceivedBagDetail, 'rbd');
      const counts: Array<{ count: string }> = await Promise.all(
        data.map(rb =>
          detailRepo
            .findOneRaw()
            .selectRaw(['COUNT(rbd.received_bag_id)', 'count'])
            .andWhere(e => e.receivedBagId, w => w.equals(rb.receivedBagId))
            .andWhere(e => e.isDeleted, w => w.isFalse())
            .exec(),
        ),
      );
      data.forEach(
        (rb, i) => (rb.totalBagNumber = parseInt(counts[i].count, 10)),
      );
    }

    const result = new ReceiptScaninListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findReceiptScanInDetailList(
    payload: BaseMetaPayloadVm,
  ): Promise<ReceiptScaninDetailListResponseVm> {
    payload.fieldResolverMap['receivedBagId'] = 'rbd.received_bag_id';
    payload.fieldResolverMap['receivedBagDetailId'] =
      'rbd.received_bag_detail_id';
    payload.fieldResolverMap['bagNumber'] = 'rbd.bag_number';

    payload.globalSearchFields = [
      { field: 'receivedBagId' },
      { field: 'receivedBagDetailId' },
      { field: 'bagNumber' },
    ];

    const repo = new OrionRepositoryService(ReceivedBagDetail, 'rbd');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['rbd.received_bag_id', 'receivedBagId'],
      ['rbd.received_bag_detail_id', 'receivedBagDetailId'],
      ['rbd.bag_number', 'bagNumber'],
      ['rbd.bag_weight', 'bagWeight'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReceiptScaninDetailListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
