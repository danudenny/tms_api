import { Injectable } from '@nestjs/common';

import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
// import { BagItemAwbQueueService } from '../../../queue/services/bag-item-awb-queue.service';
import { BagResponseVm } from '../../models/bag.response.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { DatabaseConfig } from '../../config/database/db.config';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { TempStt } from '../../../../shared/orm-entity/temp-stt';
import moment = require('moment');

@Injectable()
export class CpsService {
  static async bag(
    payload: any,
  ): Promise<BagResponseVm> {
    const result = new BagResponseVm();

    let totalProcess = 0;
    const bagInserted = [];
    const bagUpdated = [];

    for (const item of payload.data) {
      const timeNow = moment().toDate();

      // Get Branch Id
      let branchId = null;
      const branch = await Branch.findOne({
        where: {
          branchCode: item['Hub'],
        },
      });
      if (branch) {
        branchId = branch.branchId;
      }

      // Get Representative Id
      let representativeIdTo = null;
      const representative = await Representative.findOne({
        where: {
          representativeCode: item['Perwakilan'],
        },
      });
      if (representativeIdTo) {
        representativeIdTo = representative.representativeId;
      }

      const noSttSc = item['NoSttSc'];
      const bagNumber =  noSttSc.substring(0, 7);
      const bagItemSeq =  noSttSc.substring(8, 10);

      let bag = await Bag.findOne({
        where: {
          bagNumber,
        },
      });

      if (!bag) {
        bag = Bag.create({
          bagNumber,
          userIdCreated: 0,
          createdTime: timeNow,
        });
        bag.branchId = branchId;
        bag.refBranchCode = item['Hub'];
        bag.representativeIdTo = representativeIdTo;
        bag.refRepresentativeCode = item['Perwakilan'];
        bag.bagDate = item['TglTransaksi'];
        bag.bagDateReal = item['TglInput'];
        bag.userIdUpdated = 0;
        bag.updatedTime = timeNow;
        await Bag.insert(bag);

        bagInserted.push(noSttSc);
      } else {
        await Bag.update(bag.bagId, {
          branchId,
          refBranchCode: item['Hub'],
          representativeIdTo,
          refRepresentativeCode: item['Perwakilan'],
          bagDate: item['TglTransaksi'],
          bagDateReal: item['TglInput'],
          userIdUpdated: 0,
          updatedTime: timeNow,
        });

        bagUpdated.push(noSttSc);
      }

      let isCreateHistory = false;

      let bagItem = await BagItem.findOne({
        bagId: bag.bagId,
        bagSeq: bagItemSeq,
      });

      if (!bagItem) {
        bagItem = BagItem.create({
          userIdCreated: 0,
          createdTime: timeNow,
          bagItemStatusIdLast: 500,
        });
        bagItem.branchIdLast = branchId;
        bagItem.bagId = bag.bagId;
        bagItem.bagSeq = bagItemSeq;
        bagItem.weight = item['TotalBerat'];
        bagItem.userIdUpdated = 0;
        bagItem.updatedTime = timeNow;
        await BagItem.insert(bagItem);

        isCreateHistory = true;
      } else {
        await BagItem.update(bagItem.bagItemId, {
          branchIdLast: branchId,
          bagId: bag.bagId,
          bagSeq: bagItemSeq,
          weight: item['TotalBerat'],
          userIdUpdated: 0,
          updatedTime: timeNow,
        });
      }

      if (isCreateHistory) {
        const bagItemHistory = BagItemHistory.create();
        bagItemHistory.bagItemId = bagItem.bagItemId.toString();
        bagItemHistory.userId = '0';
        bagItemHistory.branchId = branchId;
        bagItemHistory.historyDate = timeNow;
        bagItemHistory.bagItemStatusId = '500';
        bagItemHistory.userIdCreated = 0;
        bagItemHistory.createdTime = timeNow;
        bagItemHistory.userIdUpdated = 0;
        bagItemHistory.updatedTime = timeNow;
        await BagItemHistory.insert(bagItemHistory);

        await BagItem.update(bagItem.bagItemId, {
          bagItemHistoryId: Number(bagItemHistory.bagItemHistoryId),
        });
      }

      await BagItemAwb.update({
        bagItemId: bagItem.bagItemId,
      }, {
        isDeleted: true,
      });

      const arrBag: BagItemAwb[] = [];
      for (const data of item['list_item']) {
        const bagItemAwb = BagItemAwb.create(
          {
            bagItemId: bagItem.bagItemId,
            awbNumber: data['NoSTT'],
            weight: data['Berat'],
            createdTime: timeNow,
            updatedTime: timeNow,
            userIdCreated: 0,
            userIdUpdated: 0,
          },
        );
        arrBag.push(bagItemAwb);
      }
      await BagItemAwb.insert(arrBag);

      await BagItemAwb.delete({
        bagItemId: bagItem.bagItemId,
        isDeleted: true,
      });

      PinoLoggerService.debug('##### BAG ID : ' + bag.bagId  + ' =======================================================');
      PinoLoggerService.debug('##### BAG ITEM ID : ' + bagItem.bagItemId  + ' =======================================================');

      // BagItemAwbQueueService.addData(arrAwb);

      totalProcess += 1;
    }

    result.total_process = totalProcess;
    result.bag_inserted = bagInserted;
    result.bag_updated = bagUpdated;

    return result;
  }

  static async sttMysql(
    payload: any,
  ): Promise<any> {
    const result = [];
    const logTitle = '[INTEGRATION STT MYSQL] ';

    const conn = await DatabaseConfig.getMySqlDbConn();

    const data = await this.getStt('mysql');
    if (data) {
      for (const item of data) {
        await conn.query('SELECT nostt FROM stt WHERE nostt = ' + conn.escape(item.nostt),  async function(err, results) {
          PinoLoggerService.debug(logTitle, this.sql);
          if (!err) {
            let query = `INSERT INTO stt (
                nostt, gerai, asal, tujuan, codNilai, codBiaya, packingBiaya, asuransiNilai, asuransiBiaya, koli, berat, biaya, totalbiaya,
                tglinput, tgltransaksi, keterangan, asuransiAdm, harga, username, hub, nohppenerima, pengirim, penerima, beratAsli, TglFoto,
                Perwakilan, zonatujuan, reseller, nohpreseller, resiJne, noKonfirmasi, hubkirim, diskon, Layanan, TglPending, TglManifested,
                BeratVolume, KetVolume, GroupPOD, GroupAnalisa, GroupTujuan, ETA1, ETA2, Sync, is_void
              ) VALUES ?`
            ;

            let values = [[
                item.nostt, item.gerai, item.asal, item.tujuan, item.codnilai, item.codbiaya, item.packingbiaya,
                item.asuransinilai, item.asuransibiaya, item.koli, item.berat, item.biaya, item.totalbiaya,
                item.tglinput, item.tgltransaksi, item.keterangan, item.asuransiadm, item.harga, item.username,
                item.hub, item.nohppenerima, item.pengirim, item.penerima, item.beratasli, item.tglfoto,
                item.perwakilan, item.zonatujuan, item.reseller, item.nohpreseller, item.resijne,
                item.nokonfirmasi, item.hubkirim, item.diskon, item.layanan, item.tglpending, item.tglmanifested,
                item.beratvolume, item.ketvolume, item.grouppod, item.groupanalisa, item.grouptujuan, item.eta1,
                item.eta2, item.sync, item.is_void,
            ]];
            PinoLoggerService.debug('===========', results);
            if (results.length > 0) {
              // Stt Exist
              query = `UPDATE stt SET
                gerai=?, asal=?, tujuan=?, codNilai=?, codBiaya=?, packingBiaya=?, asuransiNilai=?, asuransiBiaya=?, koli=?, berat=?, biaya=?, totalbiaya=?,
                tglinput=?, tgltransaksi=?, keterangan=?, asuransiAdm=?, harga=?, username=?, hub=?, nohppenerima=?, pengirim=?, penerima=?, beratAsli=?, TglFoto=?,
                Perwakilan=?, zonatujuan=?, reseller=?, nohpreseller=?, resiJne=?, noKonfirmasi=?, hubkirim=?, diskon=?, Layanan=?, TglPending=?, TglManifested=?,
                BeratVolume=?, KetVolume=?, GroupPOD=?, GroupAnalisa=?, GroupTujuan=?, ETA1=?, ETA2=?, Sync=?, is_void=?
                WHERE nostt=?
              `;
              values = values[0];
              values.shift();
              values.push(item.nostt);

              await conn.query(query, values, async function(err) {
                PinoLoggerService.debug(logTitle, this.sql);
                if (!err) {
                  await TempStt.update(item.nostt, {
                    is_sync_mysql: true,
                  });
                } else {
                  PinoLoggerService.error(logTitle, err.message);
                }
              });
            } else {
              await conn.query(query, [values], async function(err) {
                PinoLoggerService.debug(logTitle, this.sql);
                if (!err) {
                  await TempStt.update(item.nostt, {
                    is_sync_mysql: true,
                  });
                } else {
                  PinoLoggerService.error(logTitle, err.message);
                }
              });
            }

          } else {
            PinoLoggerService.error(logTitle, err.message);
          }
        });
        result.push(item.nostt);
      }
    }
    return result;
  }

  private static async getStt(type: string): Promise < any > {
    let additionalWhere = ' and is_sync_mysql = false ';
    const limit = 3000;
    if (type == 'pod') {
      additionalWhere = ' and is_sync_pod = false ';
    }

    const startDate = moment().add(-7, 'days').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    const query = `
        SELECT *
        FROM temp_stt
        WHERE
            lastupdatedatetimeutc >= :startDate AND lastupdatedatetimeutc< :endDate ` + additionalWhere + `
        LIMIT ` + limit + `
    `;

    return await RawQueryService.queryWithParams(query, {
      startDate,
      endDate,
      additionalWhere,
    });
  }
}
