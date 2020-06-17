import express = require('express');
import {RepositoryService} from '../../../../shared/services/repository.service';
import {RequestErrorService} from '../../../../shared/services/request-error.service';
import {PrinterService} from '../../../../shared/services/printer.service';
import {PrintSmdPayloadVm} from '../../models/print-smd-payload.vm';
import moment = require('moment');
import { PrintDoSmdPayloadQueryVm } from '../../models/print-do-smd-payload.vm';
import { PrintDoSmdDataVm, PrintDoSmdDataDoSmdDetailBagVm, PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm, PrintDoSmdVm, PrintDoSmdDataDoSmdDetailVm, PrintDoSmdDataDoSmdDetailBaggingVm } from '../../models/print-do-smd.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';

export class SmdPrintService {
  public static async printBagging(
    res: express.Response,
    queryParams: PrintSmdPayloadVm,
  ) {
    const bagging = await RepositoryService.baggingSmd
      .loadById(queryParams.id)
      .select({
        baggingId: true, // needs to be selected due to users relations are being included
        baggingCode: true,
        totalItem: true,
        totalWeight: true,
        representative: {
          representativeCode: true,
          representativeName: true,
        },
      })
      .exec();

    if (!bagging) {
      RequestErrorService.throwObj({
        message: 'Bagging tidak ditemukan',
      });
    }

    const rawPrinterCommands =
      `SIZE 80 mm, 100 mm\n` +
      `SPEED 3\n` +
      `DENSITY 8\n` +
      `DIRECTION 0\n` +
      `OFFSET 0\n` +
      `CLS\n` +
      `TEXT 30,120,"5",0,1,1,0,"BAGGING"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${bagging.baggingCode}"\n` +
      `TEXT 30,380,"3",0,1,1,"Jumlah koli : ${bagging.totalItem}"\n` +
      `TEXT 30,420,"3",0,1,1,"Berat : ${bagging.totalWeight}"\n` +
      `TEXT 30,460,"5",0,1,1,0,"${bagging.representative.representativeCode}"\n` +
      `TEXT 30,540,"3",0,1,1,"${bagging.representative.representativeName}"\n` +
      `PRINT 1\n` +
      `EOP`;

    const printerName = 'BarcodePrinter';
    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawPrinterCommands,
      printerName,
    });
  }

  public static async getBaggingData(payload) {
    const repo = new OrionRepositoryService(DoSmdDetail, 't1');
    const v = repo.findAllRaw();

    v.selectRaw(
      ['t2.bagging_id', 'baggingId'],
      ['t1.do_smd_detail_id', 'doSmdDetailId'],
      ['t2.bagging_code', 'baggingCode'],
      [`CONCAT(t2.total_weight::numeric(10,2))`, 'weight'],
      ['t3.representative_code', 'representativeCode'],
    );
    v.leftJoin(e => e.doSmdDetailItems.bagging, 't2');
    v.leftJoin(e => e.doSmdDetailItems.bagging.representative, 't3');
    v.where(e => e.doSmdDetailId, w => w.equals(payload.id));
    v.andWhere(e => e.doSmdDetailItems.bagType, w => w.equals(0));
    v.groupByRaw(`
      t2.bagging_id,
      t3.representative_code,
      t1.do_smd_detail_id
      `);
    const data = await v.exec();
    // console.log(data.length);
    let result = new PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm();

    if (data.length > 0) {
      result = data;
    } else {
      result = null;
    }

    return result;
  }

  public static async printDoSmdByRequest(
    res: express.Response,
    queryParams: PrintDoSmdPayloadQueryVm,
  ) {
    const q = RepositoryService.doSmd.findOne();
    q.leftJoin(e => e.doSmdDetails);
    q.leftJoin(e => e.doSmdDetails.doSmdDetailItems);
    q.leftJoin(e => e.doSmdVehicle);

    let doSmd = await q
      .select({
        doSmdId: true, // needs to be selected due to do_smd relations are being included
        doSmdCode: true,
        doSmdVehicle: {
          doSmdVehicleId: true,
          employee: {
            nik: true,
            nickname: true,
          },
        },
        totalBagging: true,
        totalBag: true,
        doSmdDetails: {
          arrivalTime: true,
          doSmdDetailId: true,
          sealNumber: true,
          branchTo: {
            branchName: true,
          },
          doSmdDetailItems: {
            doSmdDetailItemId: true,
            bagItem: {
              bagItemId: true, // needs to be selected due to bag_item relations are being included
              bagSeq: true,
              weight: true,
              bag: {
                bagNumber: true,
                refRepresentativeCode: true,
              },
            },
            bagType: true,
          },
        },
      })
      .where(e => e.doSmdId, w => w.equals(queryParams.id))
      .andWhere(e => e.doSmdDetails.doSmdDetailItems.bagType, w => w.equals(1))
      .andWhere(e => e.doSmdDetails.isDeleted, w => w.isFalse());

    if (!doSmd) {
      doSmd = await q
      .select({
        doSmdId: true, // needs to be selected due to do_smd relations are being included
        doSmdCode: true,
        doSmdVehicle: {
          doSmdVehicleId: true,
          employee: {
            nik: true,
            nickname: true,
          },
        },
        totalBagging: true,
        totalBag: true,
        doSmdDetails: {
          arrivalTime: true,
          doSmdDetailId: true,
          sealNumber: true,
          branchTo: {
            branchName: true,
          },
        },
      })
      .where(e => e.doSmdId, w => w.equals(queryParams.id))
      .andWhere(e => e.doSmdDetails.doSmdDetailItems.bagType, w => w.equals(0))
      .andWhere(e => e.doSmdDetails.isDeleted, w => w.isFalse());

      if (!doSmd) {
        RequestErrorService.throwObj({
          message: 'Surat jalan tidak ditemukan',
        });
      }
    }

    const response = new PrintDoSmdVm();
    const dataVm = new PrintDoSmdDataVm();
    dataVm.doSmdId = doSmd.doSmdId;
    dataVm.doSmdCode = doSmd.doSmdCode;
    dataVm.doSmdVehicle = doSmd.doSmdVehicle;
    dataVm.totalBagging = doSmd.totalBagging;
    dataVm.totalBag = doSmd.totalBag;
    const dataSmdDetailsVm: PrintDoSmdDataDoSmdDetailVm[] = [];
    const dataSmdDetailsBagVm: PrintDoSmdDataDoSmdDetailBagVm[] = [];
    const dataSmdDetailsBaggingVm: PrintDoSmdDataDoSmdDetailBaggingVm[] = [];

    const lengthDoSmd = doSmd.doSmdDetails.length;
    const payload = {
      id: null,
    };

    for (let i = 0; i < lengthDoSmd; i++) {
      const dataSmdDetailVm = new PrintDoSmdDataDoSmdDetailVm();
      const dataSmdDetailBaggingVm = new PrintDoSmdDataDoSmdDetailBaggingVm();
      dataSmdDetailVm.doSmdDetailId = doSmd.doSmdDetails[i].doSmdDetailId;
      if (!doSmd.doSmdDetails[i].arrivalTime) {
        dataSmdDetailVm.sealNumber = doSmd.doSmdDetails[i].sealNumber;
        dataSmdDetailVm.arrivalTime = doSmd.doSmdDetails[i].arrivalTime;
      } else {
        dataSmdDetailVm.sealNumber = '-';
        dataSmdDetailVm.arrivalTime = doSmd.doSmdDetails[i].arrivalTime;
      }
      dataSmdDetailVm.branchTo = doSmd.doSmdDetails[i].branchTo;

      if (doSmd.doSmdDetails[i].doSmdDetailItems[0].bagType > 0) {
        const lengthBagItem = doSmd.doSmdDetails[i].doSmdDetailItems.length;
        console.log('length: ' + doSmd.doSmdDetails[i].doSmdDetailItems.length);

        for (let j = 0; j < lengthBagItem; j++) {
          await dataSmdDetailsBagVm.push(doSmd.doSmdDetails[i].doSmdDetailItems[j]);
        }
      }

      dataSmdDetailVm.doSmdDetailItems = dataSmdDetailsBagVm;

      payload.id = doSmd.doSmdDetails[i].doSmdDetailId;
      const baggingData = await this.getBaggingData(payload);
      if (baggingData) {
        dataSmdDetailBaggingVm.baggingItem = baggingData;
        dataSmdDetailBaggingVm.bagType = 0;
        dataSmdDetailsBaggingVm.push(dataSmdDetailBaggingVm);
        dataSmdDetailVm.doSmdBaggingItems = dataSmdDetailsBaggingVm;
      }

      dataSmdDetailsVm.push(dataSmdDetailVm);
    }

    dataVm.doSmdDetails = dataSmdDetailsVm;
    response.data = dataVm;

    // console.log(dataVm);

    this.printDoSmdAndQueryMeta(
      res,
      dataVm as any,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  public static async printDoSmdAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoSmdDataVm>,
    metaQuery: {
      userId: number;
      branchId: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    const currentUser = await RepositoryService.user
      .loadById(metaQuery.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(metaQuery.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const currentDate = moment();

    // console.log(data);
    // console.log(data.doSmdDetails[0].doSmdDetailItems);
    // console.log(data.doSmdDetails[0].doSmdBaggingItems[0].baggingItem);
    return this.printDoSmd(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
      },
      templateConfig,
    );
  }

  public static async printDoSmd(
    res: express.Response,
    data: Partial<PrintDoSmdDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    const jsreportParams = {
      data,
      meta,
    };

    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'surat-muatan-darat',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }
}
