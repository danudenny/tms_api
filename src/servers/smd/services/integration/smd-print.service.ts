import express = require('express');
import {RepositoryService} from '../../../../shared/services/repository.service';
import {RequestErrorService} from '../../../../shared/services/request-error.service';
import {PrinterService} from '../../../../shared/services/printer.service';
import {PrintSmdPayloadVm, PrintBaggingPaperPayloadVm, PrintVendorPaperPayloadVm} from '../../models/print-smd-payload.vm';
import moment = require('moment');
import { PrintDoSmdPayloadQueryVm } from '../../models/print-do-smd-payload.vm';
import { PrintDoSmdDataVm, PrintDoSmdDataDoSmdDetailBagVm, PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm, PrintDoSmdVm, PrintDoSmdDataDoSmdDetailVm, PrintDoSmdDataDoSmdDetailBaggingVm, PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm, PrintDoSmdDataDoSmdDetailBagRepresentativeVm, PrintDoSmdBagRepresentativeDataDoSmdDetailBagBagRepresentativeItemVm, PrintVendorDataVm, PrintVendorVm, PrintVendorDataVendorDetailVm } from '../../models/print-do-smd.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { Bagging } from '../../../../shared/orm-entity/bagging';

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
      `TEXT 30,120,"5",0,1,1,0,"BAGGING DARAT"\n` +
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

  public static async printBaggingForPaper(
    res: express.Response,
    payload: PrintBaggingPaperPayloadVm,
  ) {
    const repo = new OrionRepositoryService(Bagging, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.bagging_code', 'baggingCode'],
      ['t1.created_time', 'createdTime'],
      [`CONCAT(t4.bag_number, LPAD(t3.bag_seq::text, 3, \'0\'))`, 'bagNumber'],
      ['CONCAT(t3.weight::numeric(10,2))', 'weight'],
      ['t5.representative_code', 'representativeCode'],
    );
    q.innerJoinRaw(
      'bagging_item',
      't2',
      't2.bagging_id = t1.bagging_id AND t2.is_deleted = false',
    );
    q.innerJoinRaw(
      'bag_item',
      't3',
      't3.bag_item_id = t2.bag_item_id AND t3.is_deleted = false',
    );
    q.innerJoinRaw(
      'bag',
      't4',
      't4.bag_id = t3.bag_id AND t4.is_deleted = false',
    );
    q.innerJoinRaw(
      'representative',
      't5',
      't5.representative_id = t1.representative_id_to AND t5.is_deleted = false',
    );
    q.where(e => e.baggingId, w => w.equals(payload.id));
    // if (payload.branchId) {
    //   q.where(e => e.branchId, w => w.equals(payload.branchId));
    // }
    const data = await q.exec();

    if (data.length > 0) {
      const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
      const date = moment(data[0].createdTime).format('YYYY-MM-DD HH:mm:ss');
      PrinterService.responseForJsReport({
        res,
        templates: [
          {
            templateName: 'bagging-surat-muatan-darat',
            templateData: {
              data,
              meta: {
                createdTime: date,
              },
            },
            printCopy: payload.printCopy ? payload.printCopy : 1,
          },
        ],
        listPrinterName,
      });
    }
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

  public static async getBagData(payload) {
    const repo = new OrionRepositoryService(DoSmdDetail, 't1');
    const v = repo.findAllRaw();

    v.selectRaw(
      ['t2.bag_item_id', 'bagItemId'],
      ['t1.do_smd_detail_id', 'doSmdDetailId'],
      ['t2.bag_seq', 'bagSeq'],
      [`CONCAT(t2.weight::numeric(10,2))`, 'weight'],
      ['t3.bag_number', 'bagNumber'],
      ['t3.ref_representative_code', 'refRepresentativeCode'],
    );
    v.leftJoin(e => e.doSmdDetailItems.bagItem, 't2');
    v.leftJoin(e => e.doSmdDetailItems.bagItem.bag, 't3');
    v.where(e => e.doSmdDetailId, w => w.equals(payload.id));
    v.andWhere(e => e.doSmdDetailItems.bagType, w => w.equals(1));
    v.groupByRaw(`
      t2.bag_item_id,
      t3.bag_number,
      t3.ref_representative_code,
      t1.do_smd_detail_id
      `);
    const data = await v.exec();
    // console.log(data.length);
    let result = new PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm();

    if (data.length > 0) {
      result = data;
    } else {
      result = null;
    }

    return result;
  }

  public static async getBagRepresentativeData(payload) {
    const repo = new OrionRepositoryService(DoSmdDetail, 't1');
    const v = repo.findAllRaw();

    v.selectRaw(
      ['t2.bag_representative_id', 'bagRepresentativeId'],
      ['t1.do_smd_detail_id', 'doSmdDetailId'],
      ['t2.bag_representative_code', 'bagRepresentativeCode'],
      [`CONCAT(t2.total_weight::numeric(10,2))`, 'weight'],
      ['t3.representative_code', 'representativeCode'],
    );
    v.leftJoin(e => e.doSmdDetailItems.bagRepresentative, 't2');
    v.leftJoin(e => e.doSmdDetailItems.bagRepresentative.representative, 't3');
    v.where(e => e.doSmdDetailId, w => w.equals(payload.id));
    v.andWhere(e => e.doSmdDetailItems.bagType, w => w.equals(2));
    v.groupByRaw(`
      t2.bag_representative_id,
      t3.representative_code,
      t1.do_smd_detail_id
      `);
    const data = await v.exec();
    // console.log(data.length);
    let result = new PrintDoSmdBagRepresentativeDataDoSmdDetailBagBagRepresentativeItemVm();

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

    const doSmd = await q
      .select({
        doSmdId: true, // needs to be selected due to do_smd relations are being included
        doSmdCode: true,
        doSmdNote: true,
        doSmdVehicle: {
          doSmdVehicleId: true,
          vehicleNumber: true,
          employee: {
            nik: true,
            nickname: true,
          },
        },
        totalBagging: true,
        totalBag: true,
        totalBagRepresentative: true,
        doSmdDetails: {
          doSmdDetailId: true,
          arrivalTime: true,
          sealNumber: true,
          totalBag: true,
          totalBagging: true,
          totalBagRepresentative: true,
          branchTo: {
            branchId: true,
            branchName: true,
            representative: {
              representativeCode: true,
            },
          },
        },
      })
      .where(e => e.doSmdId, w => w.equals(queryParams.id))
      .andWhere(e => e.doSmdDetails.isDeleted, w => w.isFalse());

    if (!doSmd) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const response = new PrintDoSmdVm();
    const dataVm = new PrintDoSmdDataVm();
    dataVm.doSmdId = doSmd.doSmdId;
    dataVm.doSmdCode = doSmd.doSmdCode;
    dataVm.doSmdNote = doSmd.doSmdNote;
    dataVm.doSmdVehicle = doSmd.doSmdVehicle;
    dataVm.totalBagging = doSmd.totalBagging;
    dataVm.totalBag = doSmd.totalBag;
    dataVm.totalBagRepresentative = doSmd.totalBagRepresentative;
    const dataSmdDetailsVm: PrintDoSmdDataDoSmdDetailVm[] = [];

    const payload = {
      id: null,
    };

    const idDetail = doSmd.doSmdDetails.filter(e => e.doSmdDetailId);

    // tslint:disable-next-line: prefer-for-of
    for (let l = 0; l < idDetail.length; l++) {
      const dataSmdDetailsBagVm: PrintDoSmdDataDoSmdDetailBagVm[] = [];
      const dataSmdDetailsBaggingVm: PrintDoSmdDataDoSmdDetailBaggingVm[] = [];
      const dataSmdDetailsBagRepresentativeVm: PrintDoSmdDataDoSmdDetailBagRepresentativeVm[] = [];

      const dataSmdDetailVm = new PrintDoSmdDataDoSmdDetailVm();
      const dataSmdDetailBagVm = new PrintDoSmdDataDoSmdDetailBagVm();
      const dataSmdDetailBaggingVm = new PrintDoSmdDataDoSmdDetailBaggingVm();
      const dataSmdDetailBagRepresentativeVm = new PrintDoSmdDataDoSmdDetailBagRepresentativeVm();

      dataSmdDetailVm.doSmdDetailId = idDetail[l].doSmdDetailId; // set ID

      if (!idDetail[l].arrivalTime) {
        dataSmdDetailVm.sealNumber = idDetail[l].sealNumber; // set Seal number
        dataSmdDetailVm.arrivalTime = idDetail[l].arrivalTime; // set Arrival time
      } else {
        dataSmdDetailVm.sealNumber = '-';
        dataSmdDetailVm.arrivalTime = idDetail[l].arrivalTime;
      }

      dataSmdDetailVm.branchTo = idDetail[l].branchTo; // set Branch To
      dataSmdDetailVm.totalBag = idDetail[l].totalBag; // set Total gabung paket
      dataSmdDetailVm.totalBagging = idDetail[l].totalBagging; // set total bagging
      dataSmdDetailVm.totalBagRepresentative = idDetail[l].totalBagRepresentative; // set total bagging

      payload.id = idDetail[l].doSmdDetailId;
      const bagDataAll = await this.getBagData(payload);
      if (bagDataAll) {
        dataSmdDetailBagVm.bagItem = bagDataAll;
        dataSmdDetailBagVm.bagType = 1;
        dataSmdDetailsBagVm.push(dataSmdDetailBagVm);
        dataSmdDetailVm.doSmdDetailItems = dataSmdDetailsBagVm;
      }
      const baggingData = await this.getBaggingData(payload);
      if (baggingData) {
        dataSmdDetailBaggingVm.baggingItem = baggingData;
        dataSmdDetailBaggingVm.bagType = 0;
        dataSmdDetailsBaggingVm.push(dataSmdDetailBaggingVm);
        dataSmdDetailVm.doSmdBaggingItems = dataSmdDetailsBaggingVm;
      }
      const bagRepresentativeData = await this.getBagRepresentativeData(payload);
      if (bagRepresentativeData) {
        dataSmdDetailBagRepresentativeVm.bagRepresentativeItem = bagRepresentativeData;
        dataSmdDetailBagRepresentativeVm.bagType = 2;
        dataSmdDetailsBagRepresentativeVm.push(dataSmdDetailBagRepresentativeVm);
        dataSmdDetailVm.doSmdBagRepresentativeItems = dataSmdDetailsBagRepresentativeVm;
      }

      dataSmdDetailsVm.push(dataSmdDetailVm);
    }

    dataVm.doSmdDetails = dataSmdDetailsVm;
    response.data = dataVm;

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

  public static async printVendorForPaper(
    res: express.Response,
    queryParams: PrintVendorPaperPayloadVm,
  ) {
    const q = RepositoryService.doSmd.findOne();
    q.leftJoin(e => e.doSmdDetails);
    q.leftJoin(e => e.doSmdDetails.doSmdDetailItems);

    const doSmd = await q
      .select({
        doSmdId: true, // needs to be selected due to do_smd relations are being included
        doSmdCode: true,
        doSmdTime: true,
        totalBagging: true,
        totalBag: true,
        totalBagRepresentative: true,
        doSmdDetails: {
          doSmdDetailId: true,
          arrivalTime: true,
          sealNumber: true,
          totalBag: true,
          totalBagging: true,
          totalBagRepresentative: true,
          branchTo: {
            branchId: true,
            branchName: true,
            representative: {
              representativeCode: true,
            },
          },
        },
        vendor: {
          vendorId: true,
          vendorCode: true,
          vendorName: true,
        },
      })
      .where(e => e.doSmdId, w => w.equals(queryParams.id))
      .andWhere(e => e.doSmdDetails.isDeleted, w => w.isFalse());

    if (!doSmd) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const response = new PrintVendorVm();
    const dataVm = new PrintVendorDataVm();
    dataVm.doSmdId = doSmd.doSmdId;
    dataVm.doSmdCode = doSmd.doSmdCode;
    dataVm.doSmdNote = doSmd.doSmdNote;
    dataVm.doSmdTime = doSmd.doSmdTime.toString();
    dataVm.doSmdVehicle = doSmd.doSmdVehicle;
    dataVm.totalBagging = doSmd.totalBagging;
    dataVm.totalBag = doSmd.totalBag;
    dataVm.totalBagRepresentative = doSmd.totalBagRepresentative;
    const dataSmdDetailsVm: PrintVendorDataVendorDetailVm[] = [];

    const payload = {
      id: null,
    };

    const idDetail = doSmd.doSmdDetails.filter(e => e.doSmdDetailId);

    // tslint:disable-next-line: prefer-for-of
    for (let l = 0; l < idDetail.length; l++) {
      const dataSmdDetailsBagVm: PrintDoSmdDataDoSmdDetailBagVm[] = [];
      const dataSmdDetailsBaggingVm: PrintDoSmdDataDoSmdDetailBaggingVm[] = [];
      const dataSmdDetailsBagRepresentativeVm: PrintDoSmdDataDoSmdDetailBagRepresentativeVm[] = [];

      const dataSmdDetailVm = new PrintVendorDataVendorDetailVm();
      const dataSmdDetailBagVm = new PrintDoSmdDataDoSmdDetailBagVm();
      const dataSmdDetailBaggingVm = new PrintDoSmdDataDoSmdDetailBaggingVm();
      const dataSmdDetailBagRepresentativeVm = new PrintDoSmdDataDoSmdDetailBagRepresentativeVm();

      dataSmdDetailVm.doSmdDetailId = idDetail[l].doSmdDetailId; // set ID

      if (!idDetail[l].arrivalTime) {
        dataSmdDetailVm.sealNumber = idDetail[l].sealNumber; // set Seal number
        dataSmdDetailVm.arrivalTime = idDetail[l].arrivalTime; // set Arrival time
      } else {
        dataSmdDetailVm.sealNumber = '-';
        dataSmdDetailVm.arrivalTime = idDetail[l].arrivalTime;
      }

      dataSmdDetailVm.branchTo = idDetail[l].branchTo; // set Branch To
      dataSmdDetailVm.totalBag = idDetail[l].totalBag; // set Total gabung paket
      dataSmdDetailVm.totalBagging = idDetail[l].totalBagging; // set total bagging
      dataSmdDetailVm.totalBagRepresentative = idDetail[l].totalBagRepresentative; // set total bagging

      payload.id = idDetail[l].doSmdDetailId;
      const bagDataAll = await this.getBagData(payload);
      if (bagDataAll) {
        dataSmdDetailBagVm.bagItem = bagDataAll;
        dataSmdDetailBagVm.bagType = 1;
        dataSmdDetailsBagVm.push(dataSmdDetailBagVm);
        dataSmdDetailVm.doSmdDetailItems = dataSmdDetailsBagVm;
      }
      const baggingData = await this.getBaggingData(payload);
      if (baggingData) {
        dataSmdDetailBaggingVm.baggingItem = baggingData;
        dataSmdDetailBaggingVm.bagType = 0;
        dataSmdDetailsBaggingVm.push(dataSmdDetailBaggingVm);
        dataSmdDetailVm.doSmdBaggingItems = dataSmdDetailsBaggingVm;
      }
      const bagRepresentativeData = await this.getBagRepresentativeData(payload);
      if (bagRepresentativeData) {
        dataSmdDetailBagRepresentativeVm.bagRepresentativeItem = bagRepresentativeData;
        dataSmdDetailBagRepresentativeVm.bagType = 2;
        dataSmdDetailsBagRepresentativeVm.push(dataSmdDetailBagRepresentativeVm);
        dataSmdDetailVm.doSmdBagRepresentativeItems = dataSmdDetailsBagRepresentativeVm;
      }

      dataSmdDetailsVm.push(dataSmdDetailVm);
    }

    dataVm.doSmdDetails = dataSmdDetailsVm;
    response.data = dataVm;
    this.printVendorAndQueryMeta(
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

  public static async printVendorAndQueryMeta(
    res: express.Response,
    data: Partial<PrintVendorDataVm>,
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

    return this.printVendor(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: moment(data.doSmdTime).format('DD/MM/YY'),
        time: moment(data.doSmdTime).format('HH:mm'),
      },
      templateConfig,
    );
  }

  public static async printVendor(
    res: express.Response,
    data: Partial<PrintVendorDataVm>,
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
          templateName: 'vendor-surat-muatan-darat',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }
}
