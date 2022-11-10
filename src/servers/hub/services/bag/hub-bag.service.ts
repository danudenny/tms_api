import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import express = require('express');
import _ = require('lodash');
import moment = require('moment');

import {
  BAG_SERVICE,
  BagService,
} from '../../../../shared/interfaces/bag.service.interface';
import { GetBagResponse } from '../../../../shared/models/bag-service.payload';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { User } from '../../../../shared/orm-entity/user';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { PrinterService } from '../../../../shared/services/printer.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { HubBagService } from '../../interfaces/hub-bag.interface';
import {
  SORTATION_MACHINE_SERVICE,
  SortationMachineService,
} from '../../interfaces/sortation-machine-service.interface';
import {
  HubBagInsertAwbPayload,
  HubBagInsertAwbResponse,
  HubBagSummary,
} from '../../models/bag/hub-bag.payload';
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

    let bagNumber: string;

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
      bagNumber = bag.bag_number;
    } else {
      // Create a new bag
      const bag = await this.bagService.create({
        branch_id: Number(perm.branchId.toString()),
        district_code: awb.district_code,
        branch_last_mile_id: awb.branch_id_lastmile,
        representative_id_to: awb.representative_id,
        representative_code: awb.representative,
        chute_number: 0,
        bag_type: 'MAN',
        transportation_mode: awb.transport_type,
        user_id: Number(auth.userId.toString()),
      });
      payload.bagId = bag.bag_id;
      payload.bagItemId = bag.bag_item_id;
      bagNumber = bag.bag_number;
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
        representativeCode: awb.representative,
        transportationMode: awb.transport_type,
        bagNumber,
      },
    };
  }

  public async get(bagItemId: string): Promise<Partial<BagItem>> {
    const q = new OrionRepositoryService(BagItem, 'bi').findOne();
    const selection = {
      weight: true,
      bagSeq: true,
      bag: { bagNumber: true, transportationMode: true },
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
      .andWhereRaw('bi.is_deleted = FALSE');
    if (!bagItem) {
      throw new NotFoundException('Gabung Paket tidak ditemukan!');
    }
    const bagSeq = bagItem.bagSeq.toString().padStart(3, '0');
    const bagNumber = `${bagItem.bag.bagNumber}${bagSeq}`;
    bagItem.bag.bagNumber = bagNumber.substring(0, 10);

    return bagItem;
  }

  public async print(
    bagItem: Partial<BagItem>,
    userId: number,
    branchId: number,
    res: express.Response,
  ): Promise<any> {
    const [user, branch] = await this.getUserAndBranch(userId, branchId);
    const now = moment();
    const meta = {
      user,
      branch,
      date: now.format('DD/MM/YY'),
      time: now.format('HH:mm'),
      awbs: bagItem.bagItemAwbs ? bagItem.bagItemAwbs.length : 0,
    };

    await PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'hub-gabungan-paket',
          templateData: { data: bagItem, meta },
        },
      ],
      listPrinterName: ['StrukPrinter'],
    });
  }

  public async getSummary(bagItemId: string): Promise<HubBagSummary> {
    const bag = await this.bagService.getBagSummary({ bag_item_id: bagItemId });
    const representative = await Representative.findOne(bag.representative_id_to, {
      select: ['representativeName'],
    });
    return {
      bagNumber: bag.bag_number,
      weight: bag.weight,
      awbs: bag.awbs,
      transportationMode: bag.transportation_mode,
      representativeCode: bag.representative_code,
      representativeName: representative.representativeName,
    };
  }

  public async printSticker(
    bagSummary: HubBagSummary,
    userId: number,
    branchId: number,
    res: express.Response,
  ): Promise<any> {
    const [user, branch] = await this.getUserAndBranch(userId, branchId);
    const now = moment().format('DD/MM/YYYY HH:mm');
    const representative = _.get(bagSummary, 'representativeName', '');
    const repTokens = representative.split(' ');
    const repChunks = _.chunk(repTokens, 2);
    const repText = repChunks.map((chunk, i) => {
      const position = i * 60 + 600;
      const text = chunk.join(' ');
      return `TEXT 30,${position},"5",0,1,1,0,"${text}"`;
    }).join('\n');

    const command = `
      SIZE 80 mm, 100 mm
      SPEED 3
      DENSITY 8
      DIRECTION 0
      OFFSET 0
      CLS
      TEXT 30,120,"5",0,1,1,0,"GABUNGAN PAKET"
      BARCODE 30,200,"128",100,1,0,3,10,"${bagSummary.bagNumber}"
      BOX 370,340,580,400,4
      TEXT 475,360,"4",0,1.2,1.2,2,"${bagSummary.transportationMode}"
      TEXT 30,360,"3",0,1,1,"Berat      : ${bagSummary.weight} Kg"
      TEXT 30,400,"3",0,1,1,"Total Paket: ${bagSummary.awbs}"
      TEXT 30,460,"2",0,1,1,0,"${branch}"
      TEXT 30,490,"2",0,1,1,0,"${user}"
      TEXT 30,520,"2",0,1,1,0,"${now}"
      TEXT 30,550,"4",0,1,1,0,"${bagSummary.representativeCode}"
      ${repText}
      PRINT 1
      EOP`;
    await PrinterService.responseForRawCommands({
      res,
      rawCommands: command.replace(/\n\s{6}/g, '\n'), // ignore code indentation
      printerName: 'BarcodePrinter',
    });
  }

  private async getUserAndBranch(
    userId: number,
    branchId: number,
  ): Promise<[string, string]> {
    const [user, branch] = await Promise.all([
      await RepositoryService.user.loadById(userId).select({
        userId: true,
        employee: {
          nickname: true,
        },
      }),
      Branch.findOne(
        { branchId, isDeleted: false },
        { select: ['branchName'] },
      ),
    ]);
    if (!branch) {
      throw new BadRequestException('Cabang tidak ditemukan!');
    }
    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    return [user.employee.nickname, branch.branchName];
  }
}
