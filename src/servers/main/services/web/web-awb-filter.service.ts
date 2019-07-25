import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { WebAwbFilterScanBagVm, WebAwbFilterScanAwbVm } from '../../models/web-awb-filter.vm';
import { WebAwbFilterScanBagResponseVm, WebAwbFilterScanAwbResponseVm } from '../../models/web-awb-filter-response.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { District } from '../../../../shared/orm-entity/district';
import { DistrictRepository } from '../../../../shared/orm-repository/district.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { ScanAwbVm } from '../../models/web-awb-filter-response.vm';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import moment = require('moment');
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';

export class WebAwbFilterService {

  constructor(
    @InjectRepository(DistrictRepository)
    private readonly districtRepository: DistrictRepository,
  ) {}

  async scanBag(payload: WebAwbFilterScanBagVm): Promise<WebAwbFilterScanBagResponseVm> {

    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);

    if (!bagData) {
      ContextualErrorService.throwObj({
        message: `No Gabung Paket ${payload.bagNumber} tidak ditemukan`,
      }, 500);
    }

    const raw_query = `
      SELECT awb.to_id, COUNT(1) as count
      FROM bag_item_awb bia
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = false
      INNER JOIN awb ON awb.awb_id = ai.awb_id AND awb.is_deleted = false
      WHERE bia.bag_item_id = '${bagData.bagItemId}' AND awb.to_type = 40 AND bia.is_deleted = false
      GROUP BY awb.to_id
    `;

    const result = await RawQueryService.query(raw_query);

    const data = [];
    for (const res of result) {
      const district = await this.districtRepository.findOne({
        where: {
          districtId: res.to_id,
        },
      });
      data.push({
        districtId: district.districtId,
        districtCode: district.districtCode,
        districtName: district.districtName,
        totalAwb: res.count,
        totalFiltered: 0,
      });
    }

    const response = new WebAwbFilterScanBagResponseVm();
    response.totalData = 0;
    response.bagItemId = bagData.bagItemId;
    response.representativeCode = bagData.bag.refRepresentativeCode;
    response.data = data;

    return response;
  }

  async scanAwb(payload: WebAwbFilterScanAwbVm): Promise<WebAwbFilterScanAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const results: ScanAwbVm[] = [];

    // get all awb_number from payload
    for (const awbNumber of payload.awbNumber) {

      // find each awb_number
      const awbItemAttr = await AwbItemAttr.findOne({
        select: ['awbItemAttrId', 'isFiltered'],
        where: {
          awbNumber,
          isDeleted: false,
        },
        relations: ['AwbItem', 'Awb'],
      });
      const res = new ScanAwbVm();
      res.awbNumber = awbNumber;

      if (awbItemAttr) {
        if (awbItemAttr.isFiltered) {
          // this awb is already filtered
          res.status = 'error';
          res.trouble = false;
          res.message = `Resi ${awbNumber} sudah tersortir`;
          results.push(res);
        } else {

          // process filter each awb
          awbItemAttr.isFiltered = true;
          await AwbItemAttr.update(awbItemAttr.awbItemAttrId, awbItemAttr);

          if (awbItemAttr.bagItemIdLast) {
            // no error, this awb is fine
            res.status = 'success';
            res.trouble = false;
            res.message = `Resi ${awbNumber} berhasil tersortir`;
            results.push(res);

          } else {
            // response error, but still process sortir, just announce for CT this awb have a trouble package combine
            res.status = 'success';
            res.trouble = true;
            res.message = `Resi ${awbNumber} berhasil tersortir, tidak terdapat pada Gabung Paket`;
            results.push(res);

            // announce for CT using table awb_trouble and the category of trouble is awb_filter
            // save data to awb_trouble
            const awbTroubleCode = await CustomCounterCode.awbTrouble(
              moment().toDate(),
            );
            const awbTrouble = AwbTrouble.create({
              awbNumber,
              awbTroubleCode,
              troubleCategory: 'awb_filtered',
              awbTroubleStatusId: 100,
              awbStatusId: 12800,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: moment().toDate(),
              userIdUpdated: authMeta.userId,
              updatedTime: moment().toDate(),
              userIdPic: authMeta.userId,
              branchIdPic: permissonPayload.branchId,
            });
            await AwbTrouble.save(awbTrouble);
          }
        }
      } else {
        // Unknown Awb, GO TO HELL
        res.status = 'error';
        res.trouble = false;
        res.message = `Resi ${awbNumber} tidak dikenali`;
        results.push(res);
      }
    }

    const response = new WebAwbFilterScanAwbResponseVm();
    response.totalData = 0;
    response.data = results;
    // response.representativeCode = bagData.bag.refRepresentativeCode;
    // response.data = data;

    return response;
  }
}
