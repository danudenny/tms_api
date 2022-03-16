import express from 'express';
import moment = require('moment');
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { PrinterService } from '../../../../../shared/services/printer.service';
import { PrintDoSortationPayloadQueryVm } from '../../../models/sortation/web/print-do-sortation-payload.vm';
import {
  PrintDoSortationVm,
  PrintDoSortationDataVm,
  PrintDoSortationDataDoSortationDetailVm,
  PrintDoSortationDataDoSortationDetailBagVm,
  PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm,
} from '../../../models/sortation/web/print-do-sortation.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';

export class SortationPrintService {
  public static async printDoSortationByRequest(
    res: express.Response,
    queryParams: PrintDoSortationPayloadQueryVm,
  ) {
    const q = RepositoryService.doSortation.findOne();
    q.leftJoin(e => e.doSortationDetails, 'doSortationDetails', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doSortationDetails.branchTo);
    q.leftJoin(e => e.doSortationDetails.branchTo.representative);
    q.leftJoin(e => e.doSortationDetails.branchTo.district);
    q.leftJoin(e => e.doSortationDetails.branchTo.district.city);
    q.leftJoin(e => e.doSortationDetails.doSortationDetailItems);
    q.leftJoin(e => e.doSortationVehicle);

    const doSortation = await q
      .select({
        doSortationId: true, // needs to be selected due to do_sortation relations are being included
        doSortationCode: true,
        note: true,
        branchNameToList: true,
        doSortationVehicle: {
          doSortationVehicleId: true,
          vehicleNumber: true,
          employee: {
            nik: true,
            nickname: true,
          },
        },
        totalBag: true,
        totalBagSortir: true,
        doSortationDetails: {
          doSortationDetailId: true,
          arrivalDateTime: true,
          totalBag: true,
          totalBagSortir: true,
          branchTo: {
            branchId: true,
            branchName: true,
            representative: {
              representativeCode: true,
            },
            district: {
              districtId: true,
              city: {
                cityId: true,
                cityName: true,
              },
            },
          },
        },
      })
      .where(e => e.doSortationId, w => w.equals(queryParams.id));

    if (!doSortation) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    } else if (
      !doSortation.doSortationDetails[0] ||
      !doSortation.doSortationDetails[0].branchTo
    ) {
      RequestErrorService.throwObj({
        message: 'Gerai tujuan surat jalan tidak valid',
      });
    }
    const response = new PrintDoSortationVm();
    const dataVm = new PrintDoSortationDataVm();
    dataVm.doSortationId = doSortation.doSortationId;
    dataVm.doSortationCode = doSortation.doSortationCode;
    dataVm.doSortationNote = doSortation.note;
    dataVm.doSortationVehicle = doSortation.doSortationVehicle;
    dataVm.totalBag = doSortation.totalBag;
    dataVm.totalBagSortir = doSortation.totalBagSortir;
    const dataSortationDetailsVm: PrintDoSortationDataDoSortationDetailVm[] = [];

    const payload = {
      id: null,
    };

    const idDetail = doSortation.doSortationDetails.filter(
      e => e.doSortationDetailId,
    );

    // tslint:disable-next-line: prefer-for-of
    for (let l = 0; l < idDetail.length; l++) {
      const dataSortationDetailsBagVm: PrintDoSortationDataDoSortationDetailBagVm[] = [];

      const dataSortationDetailVm = new PrintDoSortationDataDoSortationDetailVm();
      const dataSortationDetailBagVm = new PrintDoSortationDataDoSortationDetailBagVm();

      dataSortationDetailVm.doSortationDetailId =
        idDetail[l].doSortationDetailId; // set ID
      dataSortationDetailVm.arrivalTime = idDetail[l].arrivalDateTime;

      dataSortationDetailVm.branchTo = idDetail[l].branchTo; // set Branch To
      dataSortationDetailVm.totalBag = idDetail[l].totalBag; // set Total gabung paket
      dataSortationDetailVm.totalBagSortir = idDetail[l].totalBagSortir; // set total gabung sortir

      payload.id = idDetail[l].doSortationDetailId;
      const bagDataAll = await this.getBagData(payload);
      if (bagDataAll) {
        dataSortationDetailBagVm.bagItem = bagDataAll;
        dataSortationDetailBagVm.bagType = 1;
        dataSortationDetailsBagVm.push(dataSortationDetailBagVm);
        dataSortationDetailVm.doSortationDetailItems = dataSortationDetailsBagVm;
      }

      dataSortationDetailsVm.push(dataSortationDetailVm);
    }

    dataVm.doSortationDetails = dataSortationDetailsVm;
    response.data = dataVm;

    this.printDoSortationAndQueryMeta(
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

  public static async printDoSortationAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoSortationDataVm>,
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

    return this.printDoSortation(
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

  public static async printDoSortation(
    res: express.Response,
    data: Partial<PrintDoSortationDataVm>,
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
    const templateName = 'surat-jalan-sortation';
    // const templateName = isEmpty ? 'surat-jalan-kosong' : 'surat-muatan-darat';
    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];

    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName,
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }

  public static async getBagData(payload) {
    const repo = new OrionRepositoryService(DoSortationDetail, 't1');
    const v = repo.findAllRaw();

    v.selectRaw(
      ['t2.bag_item_id', 'bagItemId'],
      ['t1.do_sortation_detail_id', 'doSortationDetailId'],
      ['t2.bag_seq', 'bagSeq'],
      [`CONCAT(t2.weight::numeric(10,2))`, 'weight'],
      ['t3.bag_number', 'bagNumber'],
    );
    v.leftJoin(e => e.doSortationDetailItems.bagItem, 't2');
    v.leftJoin(e => e.doSortationDetailItems.bagItem.bag, 't3');
    v.where(e => e.doSortationDetailId, w => w.equals(payload.id));
    // v.andWhere(e => e.doSortationDetailItems.bagType, w => w.equals(1));
    v.groupByRaw(`
      t2.bag_item_id,
      t3.bag_number,
      t1.do_sortation_detail_id
      `);
    const data = await v.exec();

    let result = new PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm();

    if (data.length > 0) {
      result = data;
    } else {
      result = null;
    }

    return result;
  }
}
