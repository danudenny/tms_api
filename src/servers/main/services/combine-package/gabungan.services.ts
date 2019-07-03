import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { toInteger, sampleSize } from 'lodash';
import moment = require('moment');
import { GabunganFindAllResponseVm } from '../../models/gabungan.response.vm';
import { GabunganPayloadVm } from '../../models/gabungan-payload.vm';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { BagItemRepository } from '../../../../shared/orm-repository/bagItem.repository';
import { BagItemAwbRepository } from '../../../../shared/orm-repository/bagItemAwb.repository';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';

@Injectable()
export class GabunganService {

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(BagRepository)
    private readonly bagRepository: BagRepository,
    @InjectRepository(BagItemRepository)
    private readonly bagItemRepository: BagItemRepository,
    @InjectRepository(BagItemAwbRepository)
    private readonly bagItemAwbRepository: BagItemAwbRepository,
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
  ) {}
  async gabunganAwb(payload: GabunganPayloadVm): Promise<GabunganFindAllResponseVm> {
    // const authMeta = AuthService.getAuthMetadata();

    // if (!!authMeta) {
      const dataItem = [];
      const timeNow = moment().toDate();
      // const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

      // console.log( moment().format('DD'))
      // console.log( moment().format('MM'))
      const random = sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678900123456789001234567890', 7).join('');

      let awb;
      let data;
      let checkbag;
      let bagNumber;
      let totalSuccess = 0;
      let totalError = 0;
    // insert to bag

      const bag = this.bagRepository.create({

        bagNumber: random,
        representativeIdTo: 12,
        userIdCreated: 14,
        createdTime: timeNow,
        userIdUpdated: 14,
        updatedTime: timeNow,
        branchId: 12,
      });
      await this.bagRepository.save(bag);
      bagNumber = random;
// insert to bag item
      const bagItem = this.bagItemRepository.create({
        bagId: bag.bagId,
        bagSeq: 1,
        userIdCreated: 14,
        createdTime: timeNow,
        userIdUpdated: 14,
        updatedTime: timeNow,
      });
      await this.bagItemRepository.save(bagItem);

      for (const awbNumbers of payload.awbNumber) {
        // NOTE:
        // console.log(payload.awbNumber)
        // console.log(awbNumbers)

        // checkbag = await this.bagRepository.findOne({
        //   select: ['bagId', 'branchId'],
        //   where: { awbNumbers },
        // });
        // console.log(awb)
        if (bagItem) {
            // save data to table bagAwbItem
          const bagAwbItem = this.bagItemAwbRepository.create();
          bagAwbItem.bagItemId = bagItem.bagItemId;
          bagAwbItem.awbNumber = awbNumbers;
          bagAwbItem.userIdCreated = bagItem.userIdCreated;
          bagAwbItem.userIdUpdated = bagItem.userIdUpdated;
          bagAwbItem.updatedTime = bagItem.updatedTime;
          bagAwbItem.createdTime = moment().toDate();
          await this.bagItemAwbRepository.save(bagAwbItem);

          totalSuccess += 1;
          dataItem.push({
            bagNumber,
            status: 'ok',
            message: 'Success',
          });
        } else {
            totalError += 1;
            dataItem.push({
              bagNumber,
                status : 'error',
                message:  `No Bag ${bagNumber} Tidak di Temukan`,
            });
          }

        const result = new GabunganFindAllResponseVm();
        data = bag.bagNumber;
        result.data  = dataItem;
        console.log(dataItem);
        return result ;

        }
    }
  }
