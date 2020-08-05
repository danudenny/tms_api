import fs = require('fs');
import * as moment from 'moment';
import * as path from 'path';

import { DateHelper } from '../../../../../shared/helpers/date-helpers';
import { BaseMetaPayloadFilterVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AwsS3Service } from '../../../../../shared/services/aws-s3.service';
import { ConfigService } from '../../../../../shared/services/config.service';
import { MongoDbConfig } from '../../../config/database/mongodb.config';
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception';
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { CodExportMongoQueueService } from '../../../../queue/services/cod/cod-export-queue.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import uuid = require('uuid');

export class V1WebReportCodService {
  static expireOnSeconds = 300; // 5 minute

  static async addQueueBullPrint(filters, cod = true, awbFilter = null) {
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();
    const reportKey = `reportKeyCOD:${uuidString}`;

    // send to background process generate report
    CodExportMongoQueueService.perform(filters, cod, awbFilter, reportKey);

    const result = {
      reportKey,
      status: 'ok',
      message: 'on Process Generate Report',
    };
    // init set data on redis
    await RedisService.setex(
      reportKey,
      JSON.stringify(result),
      this.expireOnSeconds,
    );

    return result;
  }

  static async getuuidString(reportKey) {
    const dataRedis = await RedisService.get(reportKey, true);
    return dataRedis;
  }

  // filter code
  static filterList(filters: BaseMetaPayloadFilterVm[]) {
    const filterList: any = [];
    let filterStart: Date = null;
    let filterEnd: Date = null;

    filters.forEach(filter => {
      if (filter.field == 'periodStart' && filter.value) {
        const summaryDate: string = filter.value;
        const dStart = moment(summaryDate).add(7, 'hour').toDate();
        filterStart = dStart;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const finishDate: string = moment(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00');
        const dEnd = moment(finishDate).toDate();
        filterEnd = dEnd;
      }

      if (filterStart && filterEnd) {
        const filterJson = {
          createdTime: {
            $gte: filterStart,
            $lt: filterEnd,
          },
        };
        filterList.push(filterJson);
      }

      if (filter.field == 'supplier' && filter.value) {
        const f = {
          partnerId: { $eq: filter.value },
        };

        filterList.push(f);
      }

      if (filter.field == 'awbStatus' && filter.value) {
        const f = {
          supplierInvoiceStatusId: { $eq: filter.value },
        };

        filterList.push(f);
      }

      if (filter.field == 'branchLast' && filter.value) {
        const f = {
          branchId: { $eq: filter.value },
        };

        filterList.push(f);
      }
      if (filter.field == 'transactionStatus' && filter.value) {
        const f = {
          transactionStatusId: { $eq: filter.value },
        };

        filterList.push(f);
      }

      if (filter.field == 'sigesit' && filter.value) {
        const f = {
          userIdDriver: { $eq: filter.value },
        };

        filterList.push(f);
      }

    });

    const f = {
      supplierInvoiceStatusId: { $eq: 45000 },
    };

    filterList.push(f);

    return filterList;
  }

  static filterListAwb(filters: BaseMetaPayloadFilterVm[]) {
    const filterList: any = [];
    let filterStart: Date = null;
    let filterEnd: Date = null;

    filters.forEach(filter => {
      if (filter.field == 'periodStart' && filter.value) {
        const summaryDate: string = filter.value;
        const dStart = moment(summaryDate).add(7, 'hour').toDate();
        filterStart = dStart;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const finishDate: string = moment(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00');
        const dEnd = moment(finishDate).toDate();
        filterEnd = dEnd;
      }

      if (filterStart && filterEnd) {
        const filterJson = {
          lastTrackingDateTime: {
            $gte: filterStart,
            $lt: filterEnd,
          },
        };
        filterList.push(filterJson);
      }

      if (filter.field == 'supplier' && filter.value) {
        const filterValue = new RegExp(filter.value);
        const f = {
          partnerName: filterValue,
        };

        filterList.push(f);
      }

      if (filter.field == 'awbStatus' && filter.value) {
        const f = {
          lastTrackingType: { $eq: filter.value },
        };
        filterList.push(f);
      }

      if (filter.field == 'branchLast' && filter.value) {
        const f = {
          lastValidTrackingSiteCode: { $eq: filter.value },
        };
        filterList.push(f);
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        const f = {
          transactionStatusId: { $eq: filter.value },
        };
        filterList.push(f);
      }

      if (filter.field == 'sigesit' && filter.value) {
        const f = {
          userIdDriver: { $eq: filter.value },
        };
        filterList.push(f);
      }

    });

    const f = {
      isCod: { $eq: true },
    };

    filterList.push(f);

    return filterList;
  }

  // csv file code
  static async getCSVConfig(cod = true) {
    const csvHeaders: any = cod ? [
      'Partner',
      'Awb Date',
      'Awb',
      'Package Amount',
      'Cod Amount',
      'Cod Fee',
      'Amount Transfer',
      'Pod Datetime',
      'Recipient',
      'Status Internal',
      'Tracking Status',
      'Cust Package',
      'Pickup Source',
      'Current Position',
      'Destination Code',
      'Destination',
      'Package Detail',
      'Services',
      'Note',
      'Submitted Date',
      'Submitted Number',
    ] : [
        'Partner',
        'Awb Date',
        'Awb',
        'Package Amount',
        'Cod Amount',
        'Amount Transfer',
        'Pod Datetime',
        'Recipient',
        'Status Internal',
        'Tracking Status',
        'Cust Package',
        'Pickup Source',
        'Current Position',
        'Destination Code',
        'Destination',
        'Package Detail',
        'Services',
        'Note',
        'Submitted Date',
        'Submitted Number',
      ];

    const csvConfig = cod ?
      this.prepareCsvFile('COD', csvHeaders) :
      this.prepareCsvFile('COD_nonfee', csvHeaders);
    return csvConfig;
  }

  // TODO: add params for custom name file
  static prepareCsvFile(fn, headers): any {
    const appRoot = require('app-root-path');
    const uuidv1 = require('uuid/v1');
    const fileName = moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const basePath = path.join(appRoot.path, 'dist/public/temps');
    // NOTE: Test only
    // const fileName = `${fn}.csv`; // moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const filePath = basePath + '/' + fileName;
    const urlPath = 'public/temps/' + fileName;

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const csvConfig: any = {
      headers,
      separator: ',',
      newline: '\n',
    };

    const csvWriter = require('csv-write-stream');
    const writer = csvWriter(csvConfig);

    writer.pipe(fs.createWriteStream(filePath));
    writer.end();

    return {
      basePath,
      fileName,
      filePath,
      urlPath,
      config: csvConfig,
    };
  }

  // private ==================================================================
  static async populateDataCsv(
    writer, data, cod,
    draft: boolean = false,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        // writer.write(d);
        cod ?
          writer.write([
            this.strReplaceFunc(d.partnerName),
            d.awbDate ? moment(d.awbDate).format('YYYY-MM-DD') : null,
            this.strReplaceFunc(d.awbNumber),
            d.parcelValue,
            d.codValue,
            d.codFee,
            d.codValue,
            d.podDate ? moment(d.podDate).format('YYYY-MM-DD HH:mm') : null,
            this.strReplaceFunc(d.consigneeName),
            draft ? 'DRAFT INVOICE' : 'PAID', // supplier invoice status
            'DLV',
            this.strReplaceFunc(d.custPackage),
            this.strReplaceFunc(d.pickupSource),
            this.strReplaceFunc(d.currentPosition),
            this.strReplaceFunc(d.destinationCode),
            this.strReplaceFunc(d.destination),
            this.strReplaceFunc(d.parcelContent),
            this.strReplaceFunc(d.packageType),
            this.strReplaceFunc(d.parcelNote),
            '', '',
          ]) : writer.write([
            this.strReplaceFunc(d.partnerName),
            d.awbDate
              ? moment(d.awbDate).format('YYYY-MM-DD hh:mm A')
              : null,
            this.strReplaceFunc(d.awbNumber),
            d.parcelValue,
            d.codValue,
            d.codValue,
            d.podDate
              ? moment(d.podDate).format('YYYY-MM-DD hh:mm A')
              : null,
            this.strReplaceFunc(d.consigneeName),
            'DLV',
            'DLV',
            this.strReplaceFunc(d.custPackage),
            this.strReplaceFunc(d.pickupSource),
            this.strReplaceFunc(d.currentPosition),
            this.strReplaceFunc(d.destinationCode),
            this.strReplaceFunc(d.destination),
            this.strReplaceFunc(d.parcelContent),
            this.strReplaceFunc(d.packageType),
            this.strReplaceFunc(d.parcelNote),
            '', '',
          ]);

      }
      count += 1;
    } // end of while
    writer.on('data', chunk => {
      // console.log(`Received ${chunk.length} bytes of data.`);
    });

    await this.sleep(300);
    console.log(count, 'counter result');
    return true;
  }

  // private ==================================================================
  static async populateDataAwbCsv(
    writer, data,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate
            ? moment(d.awbDate).format('YYYY-MM-DD hh:mm A')
            : null,
          this.strReplaceFunc(d.awbNumber),
          d.prtParcelValue,
          d.codNilai,
          d.codNilai,
          d.lastTrackingDateTime
            ? moment(d.lastTrackingDateTime).format('YYYY-MM-DD hh:mm A')
            : null,
          this.strReplaceFunc(d.penerima),
          d.transactionStatus,
          d.lastValidTrackingType,
          this.strReplaceFunc(d.prtCustPackageId),
          this.strReplaceFunc(d.manifestTrackingSiteName),
          this.strReplaceFunc(d.lastValidTrackingSiteName),
          this.strReplaceFunc(d.prtDestinationCode),
          this.strReplaceFunc(d.tujuanKecamatan),
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.layanan),
          this.strReplaceFunc(d.receiverRemark),
          '', '',
        ]);

      }
      count += 1;
    } // end of while
    // writer.on('data', chunk => {
    //   console.log(`Received ${chunk.length} bytes of data.`);
    // });

    await this.sleep(300);
    console.log(count, 'counter result');
    return true;
  }

  static sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  static strReplaceFunc = str => {
    return str ? str.replace('\n', ' ').replace(/;/g, '|') : null;
  }

  private static deleteFile(filePath) {
    return new Promise(async (resolve, reject) => {
      try {
        // remove file
        console.log('Delete file success.');
        fs.unlinkSync(filePath);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  // main code
  static async  printSupplierInvoice(filters, cod = true, awbFilter = null, uuid: string = '') {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun ffile/ link downlod

    const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    const dbAwb = await MongoDbConfig.getDbSicepatCod('awb');
    let result: any;

    try {

      // prepare csv file
      const limit = 1000;
      const csvConfig = await this.getCSVConfig(cod);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      // get data from dbAwb if cod = false
      // start uncomment
      if (cod == false) {
        console.log(awbFilter, 'awb filter');

        console.log('in cod = false');
        // get data from collection transaction_detail
        const dataRowAwbCount = await dbAwb.aggregate([
          {
            $match: {
              $and: awbFilter,
            },
          },
        ]).toArray();
        console.log(dataRowAwbCount.length, 'data row count');
        if (dataRowAwbCount.length <= 0) {
          if (uuid != '') {
            const payload = {
              status: 'error',
              message:
                'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
            };
            await RedisService.setex(
              uuid,
              JSON.stringify(payload),
              this.expireOnSeconds,
            );
          }
          // result = { status: 'error', message: 'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.' };
          return;
        }

        if (dataRowAwbCount.length > 1048576) {
          if (uuid != '') {
            const payload = {
              status: 'error',
              message:
                'Tidak dapat menarik data.<br /> Jumlah data yang ditarik lebih dari 1 jt.',
            };
            await RedisService.setex(
              uuid,
              JSON.stringify(payload),
              this.expireOnSeconds,
            );
          }
          return;
        }

        const totalPaging = Math.ceil(dataRowAwbCount.length / limit);
        for (let index = 0; index < totalPaging; index++) {
          const usedLimit = totalPaging - 1 == index ? dataRowAwbCount.length : limit;
          console.log(index, totalPaging, dataRowAwbCount.length, limit, 'start query mongo');
          const dataRowAwb = await dbAwb.aggregate([
            {
              $match: {
                $and: awbFilter,
              },
            },
            {
              $skip: limit * (index),
            },
            {
              $limit: usedLimit,
            },
            {
              $lookup: {
                from: 'spartan_awb_summary',
                as: 'sa',
                let: { awbNumber: '$awbNumber' },
                pipeline: [
                  {
                    // on inner join
                    $match:
                    {
                      $expr:
                      {
                        $and:
                          [
                            { $eq: ['$awbNumber', '$$awbNumber'] },
                          ],
                      },
                    },
                  },
                  {
                    $project: {
                      awbNumber: 1,
                      parcelContent: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$sa',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'transaction_detail',
                as: 'td',
                let: { awbNumber: '$awbNumber' },
                pipeline: [
                  {
                    // on inner join
                    $match:
                    {
                      $expr:
                      {
                        $and:
                          [
                            { $eq: ['$awbNumber', '$$awbNumber'] },
                          ],
                      },
                    },
                  },
                  {
                    $project: {
                      awbNumber: 1,
                      transactionStatusId: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$td',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                partnerName: 1,
                awbDate: 1,
                parcelContent: '$sa.parcelContent',
                transactionStatusId: '$td.transactionStatusId',
                awbNumber: 1,
                prtParcelValue: 1,
                codNilai: 1,
                lastTrackingDateTime: 1,
                penerima: 1,
                lastValidTrackingType: 1,
                tujuanKecamatan: 1,
                prtCustPackageId: 1,
                manifestTrackingSiteName: 1,
                lastValidTrackingSiteName: 1,
                prtDestinationCode: 1,
                layanan: 1,
                receiverRemark: 1,
              },
            },
          ]);

          // get array object
          const data = await dataRowAwb.toArray();

          // get id from data object

          const transactionStatusIds = [...new Set(data.map(item => item.transactionStatusId != undefined ? item.transactionStatusId : 0))];
          console.log(transactionStatusIds, 'transactionStatusIds');
          if (transactionStatusIds.length > 0 && transactionStatusIds[0] != undefined) {
            const transactionStatuses = await RawQueryService.query(
              `SELECT
              transaction_status_id, status_title
              FROM transaction_status ts
              WHERE transaction_status_id IN (${transactionStatusIds.join(',')})`,
            );
            transactionStatuses.forEach(status => {
              data.filter(e => {
                return (e.transactionStatusId == status.transaction_status_id);
              }).forEach(e => {
                console.log('ada status transaksi');
                e.transactionStatus = status.status_title;
              });
            });
          }

          data.forEach(e => {
            console.log(e.transactionStatusId, 'transaction status');
            e.transactionStatus = e.transactionStatusId != undefined ? e.transactionStatus : '-';
          });

          await this.populateDataAwbCsv(writer, data);
        }
      } else {
        // end uncomment
        // end fill excel awb
        const dataRowCod = await dbTransactionDetail.aggregate([
          {
            $match: {
              $and: filters,
            },
          },
        ]).toArray();

        const dataRowCodCount = dataRowCod.length;

        if (dataRowCod.length <= 0) {
          if (uuid !== '') {
            const payload = {
              status: 'error',
              message:
                'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
            };
            await RedisService.setex(
              uuid,
              JSON.stringify(payload),
              this.expireOnSeconds,
            );
          }
          return;
        }

        if (dataRowCod.length > 1048576) {
          if (uuid !== '') {
            const payload = {
              status: 'error',
              message:
                'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
            };
            await RedisService.setex(
              uuid,
              JSON.stringify(payload),
              this.expireOnSeconds,
            );
          }
          return;
        }

        const totalPagingCod = Math.ceil(dataRowCodCount / limit);

        for (let index = 0; index < totalPagingCod; index++) {
          const usedLimit = totalPagingCod - 1 == index ? dataRowCodCount : limit;

          // get data from collection transaction_detail
          const datarow = await dbTransactionDetail.aggregate([
            {
              $match: {
                $and: filters,
              },
            },
            {
              $skip: limit * (index),
            },
            {
              $limit: usedLimit,
            },
            {
              $project: {
                _id: 1,
                awbDate: 1,
                awbNumber: 1,
                codValue: 1,
                codFee: 1,
                consigneeName: 1,
                createdTime: 1,
                currentPosition: 1,
                custPackage: 1,
                destination: 1,
                destinationCode: 1,
                isDeleted: 1,
                packageType: 1,
                parcelContent: 1,
                parcelNote: 1,
                parcelValue: 1,
                partnerId: 1,
                partnerName: 1,
                paymentService: 1,
                pickupSource: 1,
                podDate: 1,
                transactionStatusId: 1,
                userIdCreated: 1,
                userIdUpdated: 1,
              },
            },
          ]);

          const data = await datarow.toArray();
          await this.populateDataCsv(writer, data, cod);
        }
      }
      writer.end();

      let url = '';
      const awsKey = `reports/cod/${csvConfig.fileName}`;
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey}`;
        this.deleteFile(csvConfig.filePath);

        console.log(url, 'url final');
      }

      if (uuid != '') {
        const payload = {
          status: 'ok',
          url,
        };
        await RedisService.setex(
          uuid,
          JSON.stringify(payload),
          this.expireOnSeconds,
        );
      }

      return;
    } catch (err) {
      console.log(err);
      throw err;
    }

  }

  static async exportSupplierInvoice(id: string) {
    const dbMongo = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    const datarow = await dbMongo.find({ codSupplierInvoiceId: id }).toArray();

    const dataRowCount = datarow.length;
    console.log('## TOTAL DATA :: ', dataRowCount);
    if (!datarow || datarow.length <= 0) {
      throw new BadRequestException('Data belum lengkap, coba lagi nanti!');
    }

    try {
      const csvConfig = await this.getCSVConfig();
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(
        fs.createWriteStream(csvConfig.filePath, { flags: 'a' }),
      );

      // if (dataRowCount > 1048576) {
      //   throw new Error(
      //     'Tidak dapat menarik data. Jumlah data yang ditarik lebih dari 1 jt.',
      //   );
      // }

      await this.populateDataCsv(writer, datarow, true, true);
      writer.end();

      let url = '';
      const awsKey = `reports/cod/${csvConfig.fileName}`;
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${
          storagePath.awsKey
          }`;
        this.deleteFile(csvConfig.filePath);
      }

      return { status: 'ok', url };

    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
