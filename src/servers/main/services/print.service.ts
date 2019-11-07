import express = require('express');
import { map } from 'lodash';
import moment = require('moment');

import { PrinterService } from '../../../shared/services/printer.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintBagItemPayloadQueryVm, PrintAwbPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';

export class PrintService {
  public static async printDoPodByRequest(
    res: express.Response,
    queryParams: PrintDoPodPayloadQueryVm,
  ) {
    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetails);
    q.leftJoin(e => e.userDriver.employee);

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        branchTo: {
          branchName: true,
        },
        vehicleNumber: true,
        doPodDetails: {
          doPodDetailId: true, // needs to be selected due to do_pod_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbNumber: true,
              consigneeName: true,
            },
          },
        },
      })
      .where(e => e.doPodId, w => w.equals(queryParams.id));

    if (!doPod) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: doPod,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: doPod.doPodDetails.length,
      },
    };

    PrinterService.responseForJsReport({
      res,
      printerName: 'StrukPrinter',
      templates: [{
        templateName: 'surat-jalan',
        templateData: jsreportParams,
        printCopy: queryParams.printCopy,
      }],
    });
  }

  public static async printDoPodBagByRequest(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetailBag);
    q.leftJoin(e => e.userDriver.employee);

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        branchTo: {
          branchName: true,
        },
        vehicleNumber: true,
        doPodDetailBag: {
          doPodDetailBagId: true, // needs to be selected due to do_pod_detail relations are being included
          bagItem: {
            bagItemId: true, // needs to be selected due to bag_item relations are being included
            bagSeq: true,
            weight: true,
            bag: {
              bagNumber: true,
              refRepresentativeCode: true,
            },
          },
        },
      })
      .where(e => e.doPodId, w => w.equals(queryParams.id));

    if (!doPod) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const bagItemIds = map(doPod.doPodDetailBag, doPodDetail => doPodDetail.bagItem.bagItemId);
    const result = await RawQueryService.query(`SELECT COUNT(1) as cnt FROM bag_item WHERE bag_item_id IN (${bagItemIds.join(',')})`);
    const totalBagItem = result[0].cnt;

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: doPod,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: totalBagItem,
      },
    };

    PrinterService.responseForJsReport({
      res,
      printerName: 'StrukPrinter',
      templates: [{
        templateName: 'surat-jalan-gabung-paket',
        templateData: jsreportParams,
        printCopy: queryParams.printCopy,
      }],
    });
  }

  public static async printDoPodDeliverByRequest(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const q = RepositoryService.doPodDeliver.findOne();
    q.leftJoin(e => e.doPodDeliverDetails);
    q.leftJoin(e => e.userDriver.employee);

    const doPodDeliver = await q
      .select({
        doPodDeliverId: true, // needs to be selected due to do_pod_deliver relations are being included
        doPodDeliverCode: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        doPodDeliverDetails: {
          doPodDeliverDetailId: true, // needs to be selected due to do_pod_deliver_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbId: true,
              awbNumber: true,
              consigneeName: true,
              consigneeNumber: true,
              consigneeAddress: true,
              consigneeZip: true,
              totalCodValue: true,
              isCod: true,
            },
          },
        },
      })
      .where(e => e.doPodDeliverId, w => w.equals(queryParams.id));

    if (!doPodDeliver) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const awbIds = map(doPodDeliver.doPodDeliverDetails, doPodDeliverDetail => doPodDeliverDetail.awbItem.awb.awbId);
    const result = await RawQueryService.query(`SELECT COALESCE(SUM(total_cod_value), 0) as total FROM awb WHERE awb_id IN (${awbIds.join(',')})`);
    let totalAllCod = result[0].total;

    if (totalAllCod < 1) {
      totalAllCod = 0;
    }

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: doPodDeliver,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: doPodDeliver.doPodDeliverDetails.length,
        totalCod: totalAllCod,
      },
    };

    PrinterService.responseForJsReport({
      res,
      printerName: 'StrukPrinter',
      templates: [
        {
          templateName: 'surat-jalan-antar',
          templateData: jsreportParams,
          printCopy: queryParams.printCopy,
        },
        {
          templateName: 'surat-jalan-antar-admin',
          templateData: jsreportParams,
          printCopy: queryParams.printCopy,
        },
      ],
    });
  }

  public static async printBagItemForStickerByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.district);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagId: true,
        bagSeq: true,
        weight: true,
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          district: {
            districtName: true,
            districtCode: true,
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    const [{ cnt: bagItemsTotal }] = await RawQueryService.exec(
      `SELECT COUNT(1) as cnt FROM bag_item_awb WHERE bag_item_id=:bagItemId`,
      { bagItemId: bagItem.bagItemId },
    );

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: bagItem,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        bagItemsTotal,
      },
    };

    const weightNumberOnly = `${bagItem.weight}`.replace(/\D/gm, '').substring(0, 5);
    const finalWeightRounded2Decimal = parseFloat(`${bagItem.weight}`).toFixed(
      2,
    );
    const finalBagItemSeq = String(bagItem.bagSeq).padStart(3, '0');
    const finalBagItemBarcodeNumber = `${
      bagItem.bag.bagNumber
    }${finalBagItemSeq}${weightNumberOnly}`;
    const rawTsplPrinterCommands =
      `SIZE 80 mm, 100 mm\n` +
      `SPEED 3\n` +
      `DENSITY 8\n` +
      `DIRECTION 0\n` +
      `OFFSET 0\n` +
      `CLS\n` +
      `TEXT 30,120,"5",0,1,1,0,"GABUNGAN SORTIR"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${finalBagItemBarcodeNumber}"\n` +
      `TEXT 30,380,"3",0,1,1,"Koli ke : ${finalBagItemSeq}"\n` +
      `TEXT 30,420,"3",0,1,1,"Berat : ${finalWeightRounded2Decimal} Isi : ${bagItemsTotal} resi"\n` +
      `TEXT 30,460,"4",0,1,1,0,"${
        bagItem.bag.district.districtCode
      }"\n` +
      `TEXT 30,510,"5",0,1,1,0,"${
        bagItem.bag.district.districtName
      }"\n` +
      `PRINT 1\n` +
      `EOP`;

    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawTsplPrinterCommands,
      printerName: 'BarcodePrinter',
    });
  }

  public static async printBagItemForPaperByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.district);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagSeq: true,
        weight: true,
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          district: {
            districtName: true,
            districtCode: true,
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
              totalWeightFinalRounded: true,
            },
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: bagItem,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
      },
    };

    PrinterService.responseForJsReport({
      res,
      printerName: 'StrukPrinter',
      templates: [{
        templateName: 'surat-jalan-gabungan-sortir-paper',
        templateData: jsreportParams,
      }],
    });
  }

  public static async printBagItemStickerAndPaperByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    await this.printBagItemForStickerByRequest(res, queryParams);
    await this.printBagItemForPaperByRequest(res, queryParams);
  }

  public static async printAwbForStickerByRequest(
    res: express.Response,
    queryParams: PrintAwbPayloadQueryVm,
  ) {
    if (queryParams.isPartnerLogistic === '1') {
      const q = RepositoryService.awb.findOne();
      q.innerJoin(e => e.branch);

      const awbItem = await q
        .select({
          awbNumber: true,
          consigneeName: true,
          consigneeNumber: true,
          consigneeAddress: true,
          createdTime: true,
          branch: {
            branchName: true,
            phone1: true,
            address: true,
          },
        })
        .where(e => e.awbNumber, w => w.equals(queryParams.id));

      if (!awbItem) {
        RequestErrorService.throwObj({
          message: 'Resi tidak ditemukan',
        });
      }

      const currentUser = await RepositoryService.user
        .loadById(queryParams.userId)
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
        .loadById(queryParams.branchId)
        .select({
          branchName: true,
        });

      if (!currentBranch) {
        RequestErrorService.throwObj({
          message: 'Gerai asal tidak ditemukan',
        });
      }

      const m = moment();
      const jsreportParams = {
        data: awbItem,
        meta: {
          currentUserName: currentUser.employee.nickname,
          currentBranchName: currentBranch.branchName,
          date: m.format('DD/MM/YY'),
          time: m.format('HH:mm'),
        },
      };

      let data1 = `TEXT 30,100,"3",0,1,1,"Pengirim : ${awbItem.branch.branchName}"\n` +
      `TEXT 30,135,"3",0,1,1,"Telp : ${awbItem.branch.phone1}"\n`;
      let addX = 170;
      let startX = 0;
      let endX = 25;

      if (awbItem.branch.address) {
        const count = Math.round(awbItem.branch.address.length / 25);
        for (let i = 0; i < count; i++) {
          if (i === 0) {
            data1 += `TEXT 30,` + addX + `,"3",0,1,1,"Alamat : ${awbItem.branch.address.substring(startX, endX)}"\n`;
          } else {
            data1 += `TEXT 30,` + addX + `,"3",0,1,1,"${awbItem.branch.address.substring(startX, endX)}"\n`;
          }
          addX += 35;
          startX = endX;
          endX = endX + 30;
        }
      } else {
        data1 += `TEXT 30,` + addX + `,"3",0,1,1,"Alamat : ${awbItem.branch.address}"\n`;
      }

      const addYpn = addX + 70;
      const addYtl = addYpn + 35;
      let addY = addYtl + 35;
      let startY = 0;
      let endY = 25;
      let data2 = `TEXT 30,` + addYpn + `,"3",0,1,1,"Penerima : ${awbItem.consigneeName}"\n` +
      `TEXT 30,` + addYtl + `,"3",0,1,1,"Telp : ${awbItem.consigneeNumber}"\n`;

      if (awbItem.consigneeAddress) {
        const count = Math.round(awbItem.consigneeAddress.length / 25);
        for (let i = 0; i < count; i++) {
          if (i === 0) {
            data2 += `TEXT 30,` + addY + `,"3",0,1,1,"Alamat : ${awbItem.consigneeAddress.substring(startY, endY)}"\n`;
          } else {
            data2 += `TEXT 30,` + addY + `,"3",0,1,1,"${awbItem.consigneeAddress.substring(startY, endY)}"\n`;
          }
          addY += 35;
          startY = endY;
          endY = endY + 30;
        }
      } else {
        data2 += `TEXT 30,` + addY + `,"3",0,1,1,"Alamat : ${awbItem.consigneeAddress}"\n`;
      }

      const rawTsplPrinterCommands =
        `SIZE 80 mm, 100 mm\n` +
        `SPEED 3\n` +
        `DENSITY 8\n` +
        `DIRECTION 0\n` +
        `OFFSET 0\n` +
        `CLS\n` +
        data1 +
        data2 +
        `PRINT 1\n` +
        `EOP`;

      PrinterService.responseForRawCommands({
        res,
        rawCommands: rawTsplPrinterCommands,
        printerName: 'BarcodePrinter',
      });
    } else {
      const q = RepositoryService.awb.findOne();
      q.innerJoin(e => e.branch);
      q.leftJoin(e => e.representative.branch.district);

      const awbItem = await q
        .select({
          awbNumber: true,
          consigneeName: true,
          consigneeNumber: true,
          consigneeAddress: true,
          consigneeZip: true,
          createdTime: true,
          refRepresentativeCode: true,
          district: {
            districtName: true,
          },
          branch: {
            branchName: true,
            phone1: true,
            address: true,
          },
        })
        .where(e => e.awbNumber, w => w.equals(queryParams.id));
        // .andWhere(e => e.refRepresentativeCode, w => w.isNotNull);

      if (!awbItem) {
        RequestErrorService.throwObj({
          message: 'Resi tidak ditemukan',
        });
      }

      const currentUser = await RepositoryService.user
        .loadById(queryParams.userId)
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
        .loadById(queryParams.branchId)
        .select({
          branchName: true,
        });

      if (!currentBranch) {
        RequestErrorService.throwObj({
          message: 'Gerai asal tidak ditemukan',
        });
      }

      const m = moment();
      const jsreportParams = {
        data: awbItem,
        meta: {
          currentUserName: currentUser.employee.nickname,
          currentBranchName: currentBranch.branchName,
          date: m.format('DD/MM/YY'),
          time: m.format('HH:mm'),
        },
      };

      const consZip = awbItem.consigneeZip.substring((awbItem.consigneeZip.length - 3), awbItem.consigneeZip.length);
      let data1 = '';
      let addX = 370;
      let startX = 0;
      let endX = 25;

      if (awbItem.consigneeAddress) {
        const count = Math.round(awbItem.consigneeAddress.length / 25);
        for (let i = 0; i < count; i++) {
          if (i === 0) {
            data1 += `TEXT 30,` + addX + `,"2",0,1,1,"Alamat : ${awbItem.consigneeAddress.substring(startX, endX)}"\n`;
          } else {
            data1 += `TEXT 30,` + addX + `,"2",0,1,1,"${awbItem.consigneeAddress.substring(startX, endX)}"\n`;
          }
          addX += 27;
          startX = endX;
          endX = endX + 30;
        }
      } else {
        data1 += `TEXT 30,` + addX + `,"2",0,1,1,"Alamat : ${awbItem.consigneeAddress}"\n`;
      }

      let data2 = '';
      let rightX = 160;

      if (awbItem.district.districtName) {
        const disNameLength = awbItem.district.districtName.split(' ');
        const disName2word = Math.round(disNameLength.length / 2);
        let x = 0;

        for (let i = 0; i < disName2word; i++ ) {
          if (disNameLength.length < 2) {
            data2 += `TEXT 400,` + rightX + `,"2",0,1,1,"${disNameLength[x]}"\n`;
          } else {
            x++;
            if (x <= (disNameLength.length - 1)) {
              data2 += `TEXT 400,` + rightX + `,"2",0,1,1,"${disNameLength[x - 1]} ${disNameLength[x]}"\n`;
            } else {
              data2 += `TEXT 400,` + rightX + `,"2",0,1,1,"${disNameLength[x - 1]}"\n`;
            }
            x++;
          }
          rightX = rightX + 30;
        }
      }

      const rawTsplPrinterCommands =
        `SIZE 80 mm, 100 mm\n` +
        `SPEED 3\n` +
        `DENSITY 8\n` +
        `DIRECTION 0\n` +
        `OFFSET 0\n` +
        `CLS\n` +
        `BARCODE 30,120,"128",100,1,0,3,10,"${awbItem.awbNumber}"\n` +
        `TEXT 400,120,"4",0,1,1,"${awbItem.refRepresentativeCode}"\n` +
        data2 +
        `TEXT 400,` + (rightX) + `,"3",0,1,1,"${consZip}"\n` +
        `TEXT 30,280,"2",0,1,1,"No Resi : ${awbItem.awbNumber}"\n` +
        `TEXT 30,310,"2",0,1,1,"Penerima : ${awbItem.consigneeName}"\n` +
        `TEXT 30,340,"2",0,1,1,"Telp : ${awbItem.consigneeNumber}"\n` +
        data1 +
        `TEXT 30,` + (addX + 30) + `,"2",0,1,1,"Diterima Oleh,"\n` +
        `TEXT 30,` + (addX + 120) + `,"2",0,1,1,"(TTD & Nama Terang)"\n` +
        `TEXT 30,` + (addX + 220) + `,"2",0,1,1,"Pengirim : Sicepat Gerai ${awbItem.branch.branchName}"\n` +
        `TEXT 30,` + (addX + 250) + `,"2",0,1,1,"Telp : ${awbItem.branch.phone1}"\n` +
        `PRINT 1\n` +
        `EOP`;

      PrinterService.responseForRawCommands({
        res,
        rawCommands: rawTsplPrinterCommands,
        printerName: 'BarcodePrinter',
      });
    }
  }
}
