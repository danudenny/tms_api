import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { BAG_SERVICE, BagService } from '../../../../shared/interfaces/bag.service.interface';
import { GetBagResponse } from '../../../../shared/models/bag-service.payload';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { HubBagService } from '../../interfaces/hub-bag.interface';
import { SORTATION_MACHINE_SERVICE, SortationMachineService } from '../../interfaces/sortation-machine-service.interface';
import { HubBagInsertAwbPayload, HubBagInsertAwbResponse } from '../../models/bag/hub-bag.payload';
import { GetAwbResponse } from '../../models/sortation-machine/sortation-machine.payload';

@Injectable()
export class DefaultHubBagService implements HubBagService {
  constructor(
    @Inject(BAG_SERVICE) private readonly bagService: BagService,
    @Inject(SORTATION_MACHINE_SERVICE)
    private readonly sortationMachineService: SortationMachineService,
  ) {}

  public async insertAWB(
    payload: HubBagInsertAwbPayload,
  ): Promise<HubBagInsertAwbResponse> {
    const auth = AuthService.getAuthMetadata();
    const perm = AuthService.getPermissionTokenPayload();
    const promises = [];
    promises.push(
      this.sortationMachineService.getAwb({
        tracking_number: payload.awbNumber,
        sorting_branch_id: perm.branchId,
      }),
    );

    if (payload.bagId && payload.bagItemId) {
      promises.push(this.bagService.getBag({ bag_item_id: payload.bagItemId }));
    }

    const response = await Promise.all(promises);
    const awb: GetAwbResponse = response[0];

    if (payload.bagId && payload.bagItemId) {
      const bag: GetBagResponse = response[1];
      // check if awb is scanned previously
      if (bag.awbs.includes(payload.awbNumber)) {
        throw new BadRequestException('Resi sudah pernah di-scan');
      }

      // check if awb has same destination & transportation_mode
      if (awb.transport_type != bag.transportation_mode) {
        throw new UnprocessableEntityException('Mode transportasi berbeda');
      }
      if (awb.representative != bag.representative_code) {
        throw new UnprocessableEntityException('Representatif tujuan berbeda');
      }
    } else {
      // Create a new bag
      const bag = await this.bagService.create({
        branch_id: perm.branchId,
        district_code: awb.district_code,
        branch_last_mile_id: awb.branch_id_lastmile,
        representative_id_to: awb.representative_id,
        representative_code: awb.representative,
        chute_number: 0,
        bag_type: 'MAN',
        transportation_mode: awb.transport_type,
        user_id: auth.userId,
      });
      payload.bagId = bag.bag_id;
      payload.bagItemId = bag.bag_item_id;
    }

    await this.bagService.insertAWB({
      bag_id: payload.bagId,
      bag_item_id: payload.bagItemId,
      references: [
        {
          reference_number: payload.awbNumber,
          weight: awb.weight,
          awb_item_id: awb.awb_item_id,
        },
      ],
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sukses Scan Resi',
      data: {
        awbNumber: payload.awbNumber,
        bagId: payload.bagId,
        bagItemId: payload.bagItemId,
      },
    };
  }

  public async get(bagItemId: string): Promise<Partial<BagItem>> {
    const q = new OrionRepositoryService(BagItem, 'bi').findOne();
    const selection = {
      bagItemId: true,
      bagSeq: true,
      weight: true,
      bag: {
        bagId: true,
        bagNumber: true,
        branch: {
          branchName: true,
          branchCode: true,
        },
      },
      bagItemAwbs: {
        bagItemAwbId: true,
        awbItem: {
          awbItemId: true,
          awb: {
            awbNumber: true,
            consigneeName: true,
            consigneeNumber: true,
            totalWeightReal: true,
          },
        },
      },
    };
    const bagItem = await q
      .select(selection)
      .whereRaw('bi.bag_item_id_new = :id', { id: bagItemId })
      .andWhereRaw('bi.is_deleted = FALSE')
      .take(1);
    if (!bagItem) {
      throw new NotFoundException('Gabung Paket tidak ditemukan!');
    }
    if (bagItem.bagItemAwbs) {
      bagItem.bagItemAwbs.forEach(bia => {
        if (bia.awbItem && bia.awbItem.awb) {
          bia.awbItem.awb.totalWeightFinalRounded =
            bia.awbItem.awb.totalWeightReal;
        }
      });
    }
    const bagSeq = bagItem.bagSeq.toString().padStart(3, '0');
    const bagNumber = `${bagItem.bag.bagNumber}${bagSeq}`;
    bagItem.bag.bagNumber = bagNumber.substring(0, 10);

    return bagItem;
  }
}
