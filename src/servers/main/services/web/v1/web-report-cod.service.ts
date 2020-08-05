import fs = require('fs');
import * as moment from 'moment';
import * as path from 'path';
import _ = require('lodash');

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
      status: 'OK',
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
          d.lastValidTrackingDateTime
            ? moment(d.lastValidTrackingDateTime).format('YYYY-MM-DD hh:mm A')
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

  //#region NON_COD

  static async getNonCodSupplierInvoiceData(coll, transactionStatuses, filters, limit, pageNumber) {
    const spartanFilter: any = [{ isCod: true }];
    const siteFilter: any = [{ $eq: ['$id', '$$trackingSiteId'] }];
    const tdFilter: any = [{ $eq: ['$awbNumber', '$$awbNumber'] }];

    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment(filter.value).add(7, 'hour').toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $gte: d } });
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment(filter.value).add(7, 'hour').add(1, 'days').toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $lt: d } });
      }

      if (filter.field == 'awbStatus' && filter.value) {
        spartanFilter.push({ lastValidTrackingType: { $eq: filter.value } });
      }

      if (filter.field == 'supplier' && filter.value) {
        const regex = new RegExp(`^${filter.value.toLowerCase()}`, 'i');
        spartanFilter.push({ partnerName: regex });
      }

      if (filter.field == 'branchLast' && filter.value) {
        siteFilter.push({ $eq: ['$siteCode', filter.value] });
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        tdFilter.push({ $eq: ['$transactionStatusId', filter.value] });
      }

      // if (filter.field == 'sigesit' && filter.value) {
      //   const f = {
      //     userIdDriver: { $eq: filter.value },
      //   };
      //   spartanFilter.push(f);
      // }
    }

    const skip = limit * (pageNumber - 1);
    console.log(skip, limit, filters, 'coding skip limit');
    const datas = await coll
      .aggregate([
        {
          $match: {
            $and: spartanFilter,
          },
        },
        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: 'stt',
            as: 'stt',
            let: { awbNumber: '$awbNumber' },
            pipeline: [
              {
                // on inner join
                $match:
                {
                  $expr:
                  {
                    $and: [{ $eq: ['$nostt', '$$awbNumber'] }],
                  },
                },
              },
              {
                $lookup: {
                  from: 'destination',
                  as: 'destination',
                  let: { code: '$tujuan' },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr:
                        {
                          $and: [{ $eq: ['$code', '$$code'] }],
                        },
                      },
                    },
                    {
                      $project: {
                        subdistrict: 1,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: {
                  path: '$destination',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$stt',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'partner_request',
            as: 'pr',
            let: { awbNumber: '$awbNumber' },
            pipeline: [
              {
                // on inner join
                $match:
                {
                  $expr:
                  {
                    $and: [{ $eq: ['$awbNumber', '$$awbNumber'] }],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$pr',
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
                    $and: tdFilter,
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
          $lookup: {
            from: 'tracking_site',
            as: 'manifestTrackingSite',
            let: { trackingSiteId: '$manifestTrackingSiteId' },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [
                        { $eq: ['$id', '$$trackingSiteId'] },
                      ],
                  },
                },
              },
              {
                $project: {
                  city: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$manifestTrackingSite',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'tracking_site',
            as: 'lastValidTrackingSite',
            let: { trackingSiteId: '$lastValidTrackingSiteId' },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and: siteFilter,
                  },
                },
              },
              {
                $project: {
                  city: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$lastValidTrackingSite',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            partnerName: 1,
            awbNumber: 1,
            awbDate: 1,
            parcelContent: 1,
            prtParcelValue: '$pr.parcelValue',
            prtCustPackageId: '$pr.custPackageId',
            transactionStatusId: '$td.transactionStatusId',
            layanan: '$stt.layanan',
            penerima: '$stt.penerima',
            codNilai: '$stt.codNilai',
            lastValidTrackingDateTime: 1,
            lastValidTrackingType: 1,
            tujuanKecamatan: '$stt.destination.subdistrict',
            prtDestinationCode: '$stt.tujuan',
            manifestTrackingSiteName: '$manifestTrackingSite.name',
            lastValidTrackingSiteName: '$lastValidTrackingSite.name',
            receiverRemark: 1,
          },
        },
      ]).toArray();

    for (const d of datas) {
      d.transactionStatus = _.get(transactionStatuses.find(x => x.transaction_status_id === d.transactionStatusId), 'status_title') || '-';
    }
    console.log(datas);

    return datas;
  }

  static async printNonCodSupplierInvoice(filters, uuid: string = '') {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun ffile/ link downlod

    const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    const dbAwb = await MongoDbConfig.getDbSicepatCod('spartan_awb_summary');
    let result: any;

    try {
      const transactionStatuses = await RawQueryService.query(
        `SELECT transaction_status_id, status_title FROM transaction_status ts`,
      );

      // prepare csv file
      const limit = 3000;
      const csvConfig = await this.getCSVConfig(false);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      try {
        let pageNumber = 1;
        let finish = false;
        while (!finish) {
          const responseDatas = await this.getNonCodSupplierInvoiceData(dbAwb, transactionStatuses, filters, limit, pageNumber);
          if (!responseDatas || responseDatas.length < limit) {
            finish = true;
          }

          await this.populateDataAwbCsv(writer, responseDatas);
          pageNumber++;
        }
      } finally {
        writer.end();
      }

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
          status: 'OK',
          url,
        };
        await RedisService.setex(
          uuid,
          JSON.stringify(payload),
          this.expireOnSeconds,
        );
      }

      return { status: 'OK', url };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  //#endregion NON_COD

  //#region COD

  static async getCodSupplierInvoiceData(coll, filters, limit, pageNumber) {
    const filterList: any = [];

    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment(filter.value).add(7, 'hour').toDate();
        filterList.push({ createdTime: { $gte: d } });
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment(filter.value).add(7, 'hour')
          .add(1, 'days').toDate();
        filterList.push({ createdTime: { $lt: d } });
      }

      filterList.push({ supplierInvoiceStatusId: { $eq: 45000 } });

      if (filter.field == 'supplier' && filter.value) {
        filterList.push({ partnerId: { $eq: filter.value } });
      }

      if (filter.field == 'awbStatus' && filter.value) {
        filterList.push({ supplierInvoiceStatusId: { $eq: filter.value } });
      }

      if (filter.field == 'branchLast' && filter.value) {
        filterList.push({ branchId: { $eq: filter.value } });
      }
      if (filter.field == 'transactionStatus' && filter.value) {
        filterList.push({ transactionStatusId: { $eq: filter.value } });
      }

      if (filter.field == 'sigesit' && filter.value) {
        filterList.push({ userIdDriver: { $eq: filter.value } });
      }
    }

    const skip = limit * (pageNumber - 1);
    console.log(limit, skip, filterList, 'awb');
    const datas = await coll
      .aggregate([
        {
          $match: {
            $and: filterList,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
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
      ]).toArray();
    console.log(datas.length, 'data array');
    return datas;
  }

  static async printCodSupplierInvoice(filters, uuid: string = '') {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun ffile/ link downlod

    const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    let result: any;

    try {
      // prepare csv file
      const limit = 3000;
      const csvConfig = await this.getCSVConfig(true);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      try {

        let pageNumber = 1;
        let finish = false;
        while (!finish) {

          while (!finish) {
            const responseDatas = await this.getCodSupplierInvoiceData(dbTransactionDetail, filters, limit, pageNumber);

            console.log(!responseDatas, limit, finish, responseDatas.length < limit, 'response data length');
            if (responseDatas.length < limit) {
              finish = true;
            }
            await this.populateDataCsv(writer, responseDatas, true);

            pageNumber++;
          }
        }
      } finally {
        writer.end();
      }

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
          status: 'OK',
          url,
        };
        await RedisService.setex(
          uuid,
          JSON.stringify(payload),
          this.expireOnSeconds,
        );
      }

      return { status: 'OK', url };
    } catch (err) {
      console.log(err);
      throw err;
    }

  }

  //#endregion COD

  //#region OLD_DATA

  // filter code
  // static filterList(filters: BaseMetaPayloadFilterVm[]) {
  //   const filterList: any = [];
  //   let filterStart: Date = null;
  //   let filterEnd: Date = null;

  //   filters.forEach(filter => {
  //     if (filter.field == 'periodStart' && filter.value) {
  //       const summaryDate: string = filter.value;
  //       const dStart = moment(summaryDate).add(7, 'hour').toDate();
  //       filterStart = dStart;
  //     }

  //     if (filter.field == 'periodEnd' && filter.value) {
  //       const finishDate: string = moment(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00');
  //       const dEnd = moment(finishDate).toDate();
  //       filterEnd = dEnd;
  //     }

  //     if (filterStart && filterEnd) {
  //       const filterJson = {
  //         createdTime: {
  //           $gte: filterStart,
  //           $lt: filterEnd,
  //         },
  //       };
  //       filterList.push(filterJson);
  //     }

  //     if (filter.field == 'supplier' && filter.value) {
  //       const f = {
  //         partnerId: { $eq: filter.value },
  //       };

  //       filterList.push(f);
  //     }

  //     if (filter.field == 'awbStatus' && filter.value) {
  //       const f = {
  //         supplierInvoiceStatusId: { $eq: filter.value },
  //       };

  //       filterList.push(f);
  //     }

  //     if (filter.field == 'branchLast' && filter.value) {
  //       const f = {
  //         branchId: { $eq: filter.value },
  //       };

  //       filterList.push(f);
  //     }
  //     if (filter.field == 'transactionStatus' && filter.value) {
  //       const f = {
  //         transactionStatusId: { $eq: filter.value },
  //       };

  //       filterList.push(f);
  //     }

  //     if (filter.field == 'sigesit' && filter.value) {
  //       const f = {
  //         userIdDriver: { $eq: filter.value },
  //       };

  //       filterList.push(f);
  //     }

  //   });

  //   const f = {
  //     supplierInvoiceStatusId: { $eq: 45000 },
  //   };

  //   filterList.push(f);

  //   return filterList;
  // }

  // static filterListAwb(filters: BaseMetaPayloadFilterVm[]) {
  //   const filterList: any = [];
  //   let filterStart: Date = null;
  //   let filterEnd: Date = null;

  //   filterList.push({ isCod: { $eq: true } });

  //   filters.forEach(filter => {
  //     if (filter.field == 'periodStart' && filter.value) {
  //       const summaryDate: string = filter.value;
  //       const dStart = moment(summaryDate).add(7, 'hour').toDate();
  //       filterStart = dStart;
  //     }

  //     if (filter.field == 'periodEnd' && filter.value) {
  //       const finishDate: string = moment(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00');
  //       const dEnd = moment(finishDate).toDate();
  //       filterEnd = dEnd;
  //     }

  //     if (filterStart && filterEnd) {
  //       const filterJson = {
  //         lastTrackingDateTime: {
  //           $gte: filterStart,
  //           $lt: filterEnd,
  //         },
  //       };

  //       filterList.push(filterJson);
  //     }

  //     if (filter.field == 'supplier' && filter.value) {
  //       const filterValue = new RegExp(filter.value);
  //       const f = {
  //         partnerName: filterValue,
  //       };

  //       filterList.push(f);
  //     }

  //     if (filter.field == 'awbStatus' && filter.value) {
  //       const f = {
  //         lastTrackingType: { $eq: filter.value },
  //       };
  //       filterList.push(f);
  //     }

  //     if (filter.field == 'branchLast' && filter.value) {
  //       const f = {
  //         lastValidTrackingSiteCode: { $eq: filter.value },
  //       };
  //       filterList.push(f);
  //     }

  //     if (filter.field == 'transactionStatus' && filter.value) {
  //       const f = {
  //         transactionStatusId: { $eq: filter.value },
  //       };
  //       filterList.push(f);
  //     }

  //     if (filter.field == 'sigesit' && filter.value) {
  //       const f = {
  //         userIdDriver: { $eq: filter.value },
  //       };
  //       filterList.push(f);
  //     }

  //   });

  //   return filterList;
  // }

  // main code
  // static async printSupplierInvoice(filters, cod = true, awbFilter = null, uuid: string = '') {
  //   // TODO: query get data
  //   // step 1 : query get data by filter
  //   // prepare generate csv
  //   // ??upload file csv to aws s3
  //   // retrun ffile/ link downlod

  //   const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
  //   const dbAwb = await MongoDbConfig.getDbSicepatCod('spartan_awb_summary');
  //   let result: any;

  //   try {
  //     const transactionStatuses = await RawQueryService.query(
  //       `SELECT transaction_status_id, status_title FROM transaction_status ts`,
  //     );

  //     // prepare csv file
  //     const limit = 3000;
  //     const csvConfig = await this.getCSVConfig(cod);
  //     const csvWriter = require('csv-write-stream');
  //     const writer = csvWriter(csvConfig.config);
  //     writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
  //     try {
  //       // get data from dbAwb if cod = false
  //       // start uncomment
  //       if (cod == false) {
  //         console.log(awbFilter, 'awb filter');

  //         console.log('in cod = false');
  //         // get data from collection transaction_detail
  //         let datas = [];
  //         let promises = [];
  //         const count = await dbAwb.find({ $and: awbFilter }).count();
  //         const totalPage = Math.ceil(count / limit);
  //         let counter = 0;
  //         let pageNumber = 1;
  //         while (pageNumber <= totalPage) {
  //           const prom = this.getSupplierInvoiceData(dbAwb, datas, transactionStatuses, filters, limit, pageNumber, cod, awbFilter, uuid);
  //           promises.push(prom);
  //           if (counter >= 3) {
  //             await Promise.all(promises);
  //             await this.populateDataAwbCsv(writer, datas);
  //             promises = [];
  //             datas = [];
  //             counter = 0;
  //           }

  //           pageNumber++;
  //           counter++;
  //         }

  //         if (dataRowAwbCount.length <= 0) {
  //           if (uuid != '') {
  //             const payload = {
  //               status: 'error',
  //               message:
  //                 'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
  //             };
  //             await RedisService.setex(
  //               uuid,
  //               JSON.stringify(payload),
  //               this.expireOnSeconds,
  //             );
  //           }
  //           // result = { status: 'error', message: 'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.' };
  //           return;
  //         }

  //         if (dataRowAwbCount.length > 1048576) {
  //           if (uuid != '') {
  //             const payload = {
  //               status: 'error',
  //               message:
  //                 'Tidak dapat menarik data.<br /> Jumlah data yang ditarik lebih dari 1 jt.',
  //             };
  //             await RedisService.setex(
  //               uuid,
  //               JSON.stringify(payload),
  //               this.expireOnSeconds,
  //             );
  //           }
  //           return;
  //         }

  //         const totalPaging = Math.ceil(dataRowAwbCount.length / limit);
  //         for (let index = 0; index < totalPaging; index++) {
  //           const usedLimit = totalPaging - 1 == index ? dataRowAwbCount.length : limit;
  //           console.log(index, totalPaging, dataRowAwbCount.length, limit, 'start query mongo');

  //           const datas = [];
  //           const prom = this.getSupplierInvoiceData(dbAwb, datas, filters, limit, 0, cod, awbFilter, uuid);
  //           promises.push(prom);

  //           // get array object
  //           const data = await dataRowAwb.toArray();

  //           // get id from data object

  //           const transactionStatusIds = [...new Set(data.map(item => item.transactionStatusId != undefined ? item.transactionStatusId : 0))];
  //           console.log(transactionStatusIds, 'transactionStatusIds');
  //           if (transactionStatusIds.length > 0 && transactionStatusIds[0] != undefined) {
  //             const transactionStatuses = await RawQueryService.query(
  //               `SELECT
  //             transaction_status_id, status_title
  //             FROM transaction_status ts
  //             WHERE transaction_status_id IN (${transactionStatusIds.join(',')})`,
  //             );
  //             transactionStatuses.forEach(status => {
  //               data.filter(e => {
  //                 return (e.transactionStatusId == status.transaction_status_id);
  //               }).forEach(e => {
  //                 console.log('ada status transaksi');
  //                 e.transactionStatus = status.status_title;
  //               });
  //             });
  //           }

  //           data.forEach(e => {
  //             console.log(e.transactionStatusId, 'transaction status');
  //             e.transactionStatus = e.transactionStatusId != undefined ? e.transactionStatus : '-';
  //           });

  //           await this.populateDataAwbCsv(writer, data);
  //         }
  //       } else {
  //         // end uncomment
  //         // end fill excel awb
  //         const dataRowCod = await dbTransactionDetail.aggregate([
  //           {
  //             $match: {
  //               $and: filters,
  //             },
  //           },
  //         ]).toArray();

  //         const dataRowCodCount = dataRowCod.length;

  //         if (dataRowCod.length <= 0) {
  //           if (uuid !== '') {
  //             const payload = {
  //               status: 'error',
  //               message:
  //                 'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
  //             };
  //             await RedisService.setex(
  //               uuid,
  //               JSON.stringify(payload),
  //               this.expireOnSeconds,
  //             );
  //           }
  //           return;
  //         }

  //         if (dataRowCod.length > 1048576) {
  //           if (uuid !== '') {
  //             const payload = {
  //               status: 'error',
  //               message:
  //                 'Tidak dapat menarik data.<br /> Tidak ada data yang dapat di tarik.',
  //             };
  //             await RedisService.setex(
  //               uuid,
  //               JSON.stringify(payload),
  //               this.expireOnSeconds,
  //             );
  //           }
  //           return;
  //         }

  //         const totalPagingCod = Math.ceil(dataRowCodCount / limit);

  //         for (let index = 0; index < totalPagingCod; index++) {
  //           const usedLimit = totalPagingCod - 1 == index ? dataRowCodCount : limit;

  //           // get data from collection transaction_detail
  //           const datarow = await dbTransactionDetail.aggregate([
  //             {
  //               $match: {
  //                 $and: filters,
  //               },
  //             },
  //             {
  //               $skip: limit * (index),
  //             },
  //             {
  //               $limit: usedLimit,
  //             },
  //             {
  //               $project: {
  //                 _id: 1,
  //                 awbDate: 1,
  //                 awbNumber: 1,
  //                 codValue: 1,
  //                 codFee: 1,
  //                 consigneeName: 1,
  //                 createdTime: 1,
  //                 currentPosition: 1,
  //                 custPackage: 1,
  //                 destination: 1,
  //                 destinationCode: 1,
  //                 isDeleted: 1,
  //                 packageType: 1,
  //                 parcelContent: 1,
  //                 parcelNote: 1,
  //                 parcelValue: 1,
  //                 partnerId: 1,
  //                 partnerName: 1,
  //                 paymentService: 1,
  //                 pickupSource: 1,
  //                 podDate: 1,
  //                 transactionStatusId: 1,
  //                 userIdCreated: 1,
  //                 userIdUpdated: 1,
  //               },
  //             },
  //           ]);

  //           const data = await datarow.toArray();
  //           await this.populateDataCsv(writer, data, cod);
  //         }
  //       }
  //     } finally {
  //       writer.end();
  //     }

  //     let url = '';
  //     const awsKey = `reports/cod/${csvConfig.fileName}`;
  //     const storagePath = await AwsS3Service.uploadFromFilePath(
  //       csvConfig.filePath,
  //       awsKey,
  //     );

  //     if (storagePath) {
  //       url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey}`;
  //       this.deleteFile(csvConfig.filePath);

  //       console.log(url, 'url final');
  //     }

  //     if (uuid != '') {
  //       const payload = {
  //         status: 'OK',
  //         url,
  //       };
  //       await RedisService.setex(
  //         uuid,
  //         JSON.stringify(payload),
  //         this.expireOnSeconds,
  //       );
  //     }

  //     return;
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }

  // }

  //#endregion OLD_DATA

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

      return { status: 'OK', url };

    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
