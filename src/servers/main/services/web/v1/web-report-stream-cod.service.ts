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
import * as csv from 'csv';

export class V1WebReportCodStreamService {
  static expireOnSeconds = 600; // 5 minute

  static async addQueueBullPrint(filters, noncodfee) {
    console.log("inside bull command")
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();
    const reportKey = `reportKeyCOD:${uuidString}`;

    // send to background process generate report
    // console.log(filters, noncodfee, 'non code fee');
    CodExportMongoQueueService.perform(filters, noncodfee, uuidString);

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

  static CodHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Perwakilan',
    'Sigesit',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Date Updated',
    'User Updated',
  ]

  static CodNONFeeHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Perwakilan',
    'Sigesit',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Date Updated',
    'User Updated',
  ]


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
      'Tipe Pembayaran',
      'Status Internal',
      'Tracking Status',
      'Cust Package',
      'Pickup Source',
      'Current Position',
      'Destination Code',
      'Destination',
      'Perwakilan',
      'Sigesit',
      'Package Detail',
      'Services',
      'Note',
      'Submitted Date',
      'Submitted Number',
      'Date Updated',
      'User Updated',
    ] : [
        'Partner',
        'Awb Date',
        'Awb',
        'Package Amount',
        'Cod Amount',
        'Cod Fee',
        'Amount Transfer',
        'Pod Datetime',
        'Recipient',
        'Tipe Pembayaran',
        'Status Internal',
        'Tracking Status',
        'Status Invoice',
        'Cust Package',
        'Pickup Source',
        'Current Position',
        'Destination Code',
        'Destination',
        'Perwakilan',
        'Sigesit',
        'Package Detail',
        'Services',
        'Note',
        'Submitted Date',
        'Submitted Number',
        'Date Updated',
        'User Updated',
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
        writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD') : null,
          this.strReplaceFunc(d.awbNumber),
          d.parcelValue,
          d.codValue,
          d.codFee,
          d.codValue,
          d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.consigneeName),
          this.strReplaceFunc(d.paymentMethod),
          draft ? 'DRAFT INVOICE' : 'PAID', // supplier invoice status
          'DLV',
          this.strReplaceFunc(d.custPackage),
          this.strReplaceFunc(d.pickupSource),
          this.strReplaceFunc(d.currentPosition),
          this.strReplaceFunc(d.destinationCode),
          this.strReplaceFunc(d.destination),
          d.perwakilan,
          (d.userIdDriverNik ? d.userIdDriverNik : '') + ' - ' + (d.userIdDriverName ? d.userIdDriverName : ''),
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.packageType),
          this.strReplaceFunc(d.parcelNote),
          '', '',
          d.dateUpdated ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm') : null,
          (d.userIdUpdatedNik ? this.strReplaceFunc(d.userIdUpdatedNik) : '') + ' - ' + (d.userIdUpdatedName ? this.strReplaceFunc(d.userIdUpdatedName) : ''),
        ]);

      }
      count += 1;
    } // end of while
    writer.on('data', chunk => {
      // console.log(`Received ${chunk.length} bytes of data.`);
    });

    await this.sleep(100);
    // console.log(count, 'counter result');
    return true;
  }

  static streamTransform(doc) {
    // param = doc.awbNumber
    const values = [
      V1WebReportCodStreamService.strReplaceFunc(doc.partnerName),
      doc.awbDate ? moment.utc(doc.awbDate).format('YYYY-MM-DD HH:mm') : null,
      `'${doc.awbNumber}`,
      doc.tdParcelValue ? doc.tdParcelValue : doc.prtParcelValue,
      doc.codNilai,
      doc.codFee ? doc.codFee : '-',
      doc.codNilai,
      doc.lastValidTrackingDateTime ? moment.utc(doc.lastValidTrackingDateTime).format('YYYY-MM-DD HH:mm') : null,
      V1WebReportCodStreamService.strReplaceFunc(doc.penerima),
      doc.paymentMethod,
      doc.transactionStatus,
      doc.lastValidTrackingType,
      doc.supplierInvoiceStatus,
      V1WebReportCodStreamService.strReplaceFunc(doc.tdcustPackage ? doc.tdcustPackage : doc.prtReferenceNo),
      V1WebReportCodStreamService.strReplaceFunc(doc.manifestTrackingSiteName),
      V1WebReportCodStreamService.strReplaceFunc(doc.lastValidTrackingSiteName),
      V1WebReportCodStreamService.strReplaceFunc(doc.prtDestinationCode),
      V1WebReportCodStreamService.strReplaceFunc(doc.tujuanKecamatan),
      V1WebReportCodStreamService.strReplaceFunc(doc.perwakilan),
      (doc.userIdDriverNik ? doc.userIdDriverNik : '') + ' - ' + (doc.userIdDriverName ? doc.userIdDriverName : ''),
      V1WebReportCodStreamService.strReplaceFunc(doc.parcelContent),
      V1WebReportCodStreamService.strReplaceFunc(doc.layanan),
      V1WebReportCodStreamService.strReplaceFunc(doc.receiverRemark),
      "",
      "",
      doc.tdDateUpdated ? moment.utc(doc.tdDateUpdated).format('YYYY-MM-DD HH:mm') : doc.dateUpdated ? moment.utc(doc.dateUpdated).format('YYYY-MM-DD HH:mm') : null,
      (doc.tdUserIdUpdatedNik ? V1WebReportCodStreamService.strReplaceFunc(doc.tdUserIdUpdatedNik) + ' - ' + (doc.tdUserIdUpdatedName) : (doc.userIdUpdatedNik ? V1WebReportCodStreamService.strReplaceFunc(doc.userIdUpdatedNik) + ' - ' + (doc.userIdUpdatedName) : "-")),
    ];

    return `${values.join(',')} \n`;
  }


  static streamTransformCodFee(d) {
    // param = doc.awbNumber
    const values = [
      [
        V1WebReportCodStreamService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
        V1WebReportCodStreamService.strReplaceFunc(d.awbNumber),
        d.tdParcelValue ? d.tdParcelValue : d.prtParcelValue,
        d.codNilai,
        d.codFee ? d.codFee : '-',
        d.codNilai,
        d.lastValidTrackingDateTime ? moment.utc(d.lastValidTrackingDateTime).format('YYYY-MM-DD HH:mm') : null,
        V1WebReportCodStreamService.strReplaceFunc(d.penerima),
        d.paymentMethod,
        d.transactionStatus,
        d.lastValidTrackingType,
        d.supplierInvoiceStatus,
        d.tdcustPackage ? V1WebReportCodStreamService.strReplaceFunc(d.tdcustPackage) : V1WebReportCodStreamService.strReplaceFunc(d.prtReferenceNo),
        V1WebReportCodStreamService.strReplaceFunc(d.manifestTrackingSiteName),
        V1WebReportCodStreamService.strReplaceFunc(d.lastValidTrackingSiteName),
        V1WebReportCodStreamService.strReplaceFunc(d.prtDestinationCode),
        V1WebReportCodStreamService.strReplaceFunc(d.tujuanKecamatan),
        V1WebReportCodStreamService.strReplaceFunc(d.perwakilan),
        (d.userIdDriverNik ? d.userIdDriverNik : '') + ' - ' + (d.userIdDriverName ? d.userIdDriverName : ''),
        V1WebReportCodStreamService.strReplaceFunc(d.parcelContent),
        V1WebReportCodStreamService.strReplaceFunc(d.layanan),
        V1WebReportCodStreamService.strReplaceFunc(d.receiverRemark),
        '',
        '',
        d.tdDateUpdated ? moment.utc(d.tdDateUpdated).format('YYYY-MM-DD HH:mm') : d.dateUpdated ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm') : null,
        (d.tdUserIdUpdatedNik ? V1WebReportCodStreamService.strReplaceFunc(d.tdUserIdUpdatedNik) + ' - ' + (d.tdUserIdUpdatedName) : (d.userIdUpdatedNik ? V1WebReportCodStreamService.strReplaceFunc(d.userIdUpdatedNik) + ' - ' + (d.userIdUpdatedName) : "-")),
      ]

    ];

    return `${values.join(',')} \n`;
  }

  // private ==================================================================
  static async populateDataAwbCsv(
    writer, data,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        await writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.awbNumber),
          d.tdParcelValue ? d.tdParcelValue : d.prtParcelValue,
          d.codNilai,
          d.codFee ? d.codFee : '-',
          d.codNilai,
          d.lastValidTrackingDateTime ? moment.utc(d.lastValidTrackingDateTime).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.penerima),
          d.paymentMethod,
          d.transactionStatus,
          d.lastValidTrackingType,
          d.supplierInvoiceStatus,
          d.tdcustPackage ? this.strReplaceFunc(d.tdcustPackage) : this.strReplaceFunc(d.prtReferenceNo),
          this.strReplaceFunc(d.manifestTrackingSiteName),
          this.strReplaceFunc(d.lastValidTrackingSiteName),
          this.strReplaceFunc(d.prtDestinationCode),
          this.strReplaceFunc(d.tujuanKecamatan),
          this.strReplaceFunc(d.perwakilan),
          (d.userIdDriverNik ? d.userIdDriverNik : '') + ' - ' + (d.userIdDriverName ? d.userIdDriverName : ''),
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.layanan),
          this.strReplaceFunc(d.receiverRemark),
          '',
          '',
          d.tdDateUpdated ? moment.utc(d.tdDateUpdated).format('YYYY-MM-DD HH:mm') : d.dateUpdated ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm') : null,
          (d.tdUserIdUpdatedNik ? this.strReplaceFunc(d.tdUserIdUpdatedNik) + ' - ' + (d.tdUserIdUpdatedName) : (d.userIdUpdatedNik ? this.strReplaceFunc(d.userIdUpdatedNik) + ' - ' + (d.userIdUpdatedName) : "-")),
        ]);

      }
      count += 1;
    } // end of while
    // writer.on('data', chunk => {
    //   console.log(`Received ${chunk.length} bytes of data.`);
    // });

    await this.sleep(100);
    // console.log(count, 'counter result');
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
  private strReplaceFunc = str => {
    return str ? str.replace('\n', ' ').replace(/;/g, '|') : null;
  }

  private static deleteFile(filePath) {
    return new Promise(async (resolve, reject) => {
      try {
        // remove file
        // console.log('Delete file success.');
        fs.unlinkSync(filePath);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  // #region NON_COD
  // static async getNonCodSupplierInvoiceData(coll, arrDatas: any[], transactionStatuses, filters, limit, pageNumber) {
  //   const spartanFilter: any = [{ isCod: true }];
  //   const siteFilter: any = [{ $eq: ['$id', '$$trackingSiteId'] }];
  //   const tdFilter: any = [{ $eq: ['$awbNumber', '$$awbNumber'] }];
  //   let allowNullSite = true;
  //   let allowNullTd = true;

  //   for (const filter of filters) {
  //     if (filter.field == 'periodStart' && filter.value) {
  //       const d = moment.utc(moment.utc(filter.value).format("YYYY-MM-DD 00:00:00")).toDate();
  //       spartanFilter.push({ lastValidTrackingDateTime: { $gte: d } });
  //     }

  //     if (filter.field == 'periodEnd' && filter.value) {
  //       const d = moment.utc(moment.utc(filter.value).add(1, 'days').format("YYYY-MM-DD 00:00:00")).toDate();
  //       spartanFilter.push({ lastValidTrackingDateTime: { $lt: d } });
  //     }

  //     if (filter.field == 'awbStatus' && filter.value) {
  //       const fv = (filter.value === 'IN_BRANCH') ? 'IN' : filter.value;
  //       spartanFilter.push({ lastValidTrackingType: { $eq: fv } });
  //     }

  //     if (filter.field == 'supplier' && filter.value) {
  //       const regex = new RegExp(`^${filter.value.toLowerCase()}`, 'i');
  //       spartanFilter.push({ partnerName: regex });
  //     }

  //     if (filter.field == 'branchLast' && filter.value) {
  //       siteFilter.push({ $eq: ['$siteCode', filter.value] });
  //       allowNullSite = false;
  //     }

  //     if (filter.field == 'transactionStatus' && filter.value) {
  //       tdFilter.push({ $eq: ["$transactionStatusId", filter.value] });
  //       allowNullTd = false;
  //     }

  //     if (filter.field == 'supplierInvoiceStatus' && filter.value) {
  //       tdFilter.push({ $eq: ["$supplierInvoiceStatusId", filter.value] });
  //       allowNullTd = false;
  //     }

  //     // if (filter.field == 'sigesit' && filter.value) {
  //     //   const f = {
  //     //     userIdDriver: { $eq: filter.value },
  //     //   };
  //     //   spartanFilter.push(f);
  //     // }
  //   }

  //   const skip = limit * (pageNumber - 1);
  //   console.log(skip, limit, spartanFilter, 'coding skip limit');
  //   const query = coll
  //     .aggregate([
  //       {
  //         $match: {
  //           $and: spartanFilter,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'stt',
  //           as: 'stt',
  //           let: { awbNumber: '$awbNumber' },
  //           pipeline: [
  //             {
  //               // on inner join
  //               $match:
  //               {
  //                 $expr:
  //                 {
  //                   $and: [{ $eq: ['$nostt', '$$awbNumber'] }],
  //                 },
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'destination',
  //                 as: 'destination',
  //                 let: { code: '$tujuan' },
  //                 pipeline: [
  //                   {
  //                     $match:
  //                     {
  //                       $expr:
  //                       {
  //                         $and: [{ $eq: ['$code', '$$code'] }],
  //                       },
  //                     },
  //                   },
  //                   {
  //                     $project: {
  //                       subdistrict: 1,
  //                     },
  //                   },
  //                 ],
  //               },
  //             },
  //             {
  //               $unwind: {
  //                 path: '$destination',
  //                 preserveNullAndEmptyArrays: true,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$stt',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'partner_request',
  //           as: 'pr',
  //           let: { awbNumber: '$awbNumber' },
  //           pipeline: [
  //             {
  //               // on inner join
  //               $match:
  //               {
  //                 $expr:
  //                 {
  //                   $and: [{ $eq: ['$awbNumber', '$$awbNumber'] }],
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$pr',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'transaction_detail',
  //           as: 'td',
  //           let: { awbNumber: '$awbNumber' },
  //           pipeline: [
  //             {
  //               // on inner join
  //               $match:
  //               {
  //                 $expr:
  //                 {
  //                   $and: tdFilter,
  //                 },
  //               },
  //             },
  //             {
  //               $project: {
  //                 awbNumber: 1,
  //                 transactionStatusId: 1,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$td',
  //           preserveNullAndEmptyArrays: allowNullTd,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'tracking_site',
  //           as: 'manifestTrackingSite',
  //           let: { trackingSiteId: '$manifestTrackingSiteId' },
  //           pipeline: [
  //             {
  //               $match:
  //               {
  //                 $expr:
  //                 {
  //                   $and:
  //                     [
  //                       { $eq: ['$id', '$$trackingSiteId'] },
  //                     ],
  //                 },
  //               },
  //             },
  //             {
  //               $project: {
  //                 city: 1,
  //                 name: 1,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$manifestTrackingSite',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'tracking_site',
  //           as: 'lastValidTrackingSite',
  //           let: { trackingSiteId: '$lastValidTrackingSiteId' },
  //           pipeline: [
  //             {
  //               $match:
  //               {
  //                 $expr:
  //                 {
  //                   $and: siteFilter,
  //                 },
  //               },
  //             },
  //             {
  //               $project: {
  //                 city: 1,
  //                 name: 1,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$lastValidTrackingSite',
  //           preserveNullAndEmptyArrays: allowNullSite,
  //         },
  //       },

  //       { $skip: skip },
  //       { $limit: limit },

  //       {
  //         $project: {
  //           partnerName: 1,
  //           awbNumber: 1,
  //           awbDate: '$transactionDate',
  //           parcelContent: 1,
  //           prtParcelValue: '$pr.parcelValue',
  //           prtCustPackageId: '$pr.custPackageId',
  //           transactionStatusId: '$td.transactionStatusId',
  //           layanan: '$stt.layanan',
  //           penerima: '$stt.penerima',
  //           codNilai: '$stt.codNilai',
  //           lastValidTrackingDateTime: 1,
  //           lastValidTrackingType: 1,
  //           tujuanKecamatan: '$stt.destination.subdistrict',
  //           prtDestinationCode: '$stt.tujuan',
  //           manifestTrackingSiteName: '$manifestTrackingSite.name',
  //           lastValidTrackingSiteName: '$lastValidTrackingSite.name',
  //           receiverRemark: 1,
  //         },
  //       },
  //     ]);

  //   console.log(query);
  //   const datas = await query.toArray();

  //   for (const d of datas) {
  //     d.transactionStatus = _.get(transactionStatuses.find(x => x.transaction_status_id === d.transactionStatusId), 'status_title') || '-';
  //   }

  //   console.log(datas);

  //   arrDatas.push(...datas);
  //   return datas;
  // }

  // static async timeResponse(key, promise) {
  //   const startMoment = moment.utc();
  //   const response = await promise;
  //   const endMoment = moment.utc();
  //   const duration = endMoment.diff(startMoment);

  //   try {
  //     const collection = await MongoDbConfig.getDbSicepatCod('time_log_cod');
  //     await collection.insertOne({
  //       key: key,
  //       startTime: startMoment.toDate(),
  //       endTime: endMoment.toDate(),
  //       duration: duration
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   return {
  //     data: response,
  //     duration: duration
  //   }
  // }

  // static async printNonCodSupplierInvoice(filters, uuid: string = '') {
  //   // TODO: query get data
  //   // step 1 : query get data by filter
  //   // prepare generate csv
  //   // ??upload file csv to aws s3
  //   // retrun ffile/ link downlod
  //   console.log(uuid, "uuid")
  //   const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
  //   const dbAwb = await MongoDbConfig.getDbSicepatCod('spartan_awb_summary');
  //   let result: any;

  //   try {
  //     const transactionStatuses = await RawQueryService.query(
  //       `SELECT transaction_status_id, status_title FROM transaction_status ts`,
  //     );

  //     for (const transactionStatus of transactionStatuses) {
  //       transactionStatus.transaction_status_id = parseInt(`${transactionStatus.transaction_status_id}`, 10);
  //     }

  //     // prepare csv file
  //     const limit = 30000;
  //     const csvConfig = await this.getCSVConfig(false);
  //     const csvWriter = require('csv-write-stream');
  //     const writer = csvWriter(csvConfig.config);
  //     writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
  //     try {
  //       let pageNumber = 1;
  //       let datas = [];
  //       let finish = false;
  //       while (!finish) {
  //         // const promises = [];
  //         // let counter = 0;
  //         // let maxCount = 0;
  //         // while (counter < 10) {
  //         //   const pn = pageNumber;
  //         //   const prom = this.getNonCodSupplierInvoiceData(dbAwb, datas, transactionStatuses, filters, limit, pn);
  //         //   promises.push(prom);
  //         //   counter++;
  //         //   pageNumber++;
  //         //   maxCount += limit;
  //         // }

  //         // await Promise.all(promises);
  //         // if (!datas || datas.length < maxCount) {
  //         //   finish = true;
  //         // }

  //         const rawResponseData = await this.timeResponse('time_log_cod_read', this.getNonCodSupplierInvoiceData(dbAwb, datas, transactionStatuses, filters, limit, pageNumber));
  //         const responseDatas = rawResponseData.data;

  //         await this.timeResponse('time_log_cod_write_csv', this.populateDataAwbCsv(writer, responseDatas));

  //         pageNumber++;

  //         if (!responseDatas || responseDatas.length < limit) {
  //           finish = true;
  //         }

  //         // datas = [];

  //         // const responseDatas = await this.getNonCodSupplierInvoiceData(dbAwb, datas, transactionStatuses, filters, limit, pageNumber);
  //         // if (!responseDatas || responseDatas.length < limit) {
  //         //   finish = true;
  //         // }

  //         // await this.populateDataAwbCsv(writer, responseDatas);
  //         // pageNumber++;
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

  //     console.log(uuid, uuid.toString() !== '', "uuid")
  //     if (uuid.toString() !== '') {
  //       console.log("inside uuid");
  //       const payload = {
  //         status: 'OK',
  //         url,
  //       };
  //       await RedisService.setex(
  //         uuid,
  //         JSON.stringify(payload),
  //         this.expireOnSeconds
  //       );
  //     }

  //     return { status: 'OK', url };
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  // }

  static getNonCodSupplierInvoiceJoinData(coll, filters) {
    const spartanFilter: any = [];
    const tdFilter: any = [{ $eq: ['$awbNumber', '$$awbNumber'] }];
    let allowNullTd = true;

    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $gte: d } });
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $lt: d } });
      }

      if (filter.field == 'transactionStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        tdFilter.push({ $gte: ['$updatedTime', d] });
        allowNullTd = false;
      }

      if (filter.field == 'transactionEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        tdFilter.push({ $lt: ['$updatedTime', d] });
        allowNullTd = false;
      }

      if (filter.field == 'manifestedStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ awbDate: { $gte: d } });
      }

      if (filter.field == 'manifestedEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ awbDate: { $lt: d } });
      }

      if (filter.field == 'awbStatus' && filter.value) {
        const fv = (filter.value === 'IN_BRANCH') ? 'IN' : filter.value;
        spartanFilter.push({ lastValidTrackingType: { $eq: fv } });
      }

      if (filter.field == 'branchLastCode' && filter.value) {
        spartanFilter.push({ lastValidTrackingSiteCode: { $eq: filter.value } });
      }

      if (filter.field == 'supplier' && filter.value) {
        spartanFilter.push({ partnerId: filter.value });
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        tdFilter.push({ $eq: ['$transactionStatusId', filter.value] });
        allowNullTd = false;
      }

      if (filter.field == 'supplierInvoiceStatus' && filter.value) {
        tdFilter.push({ $eq: ['$supplierInvoiceStatusId', filter.value] });
        allowNullTd = false;
      }

      if (filter.field == 'sigesit' && filter.value) {
        tdFilter.push({ $eq: ['$userIdDriver', filter.value] });
        allowNullTd = false;
      }
    }

    console.log(spartanFilter, tdFilter, "filter");

    const q = [
      {
        $match: {
          $and: spartanFilter,
        },
      },
      // { "$sort": { awbNumber: 1 } },
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
            { $limit: 1 },
            {
              $project: {
                awbNumber: 1,
                transactionStatusId: 1,
                supplierInvoiceStatusId: 1,
                userIdDriver: 1,
                userIdUpdated: 1,
                adminName: 1,
                nikAdmin: 1,
                updatedTime: 1,
                paymentMethod: 1,
                transactionstatusname: 1,
                supplierInvoiceStatusName: 1,
                custPackage: 1,
                codFee: 1,
                parcelValue: 1
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$td',
          preserveNullAndEmptyArrays: allowNullTd,
        },
      },
      // {
      //   $lookup: {
      //     from: 'partner_request',
      //     as: 'pr',
      //     let: { awbNumber: '$awbNumber' },
      //     pipeline: [
      //       {
      //         // on inner join
      //         $match:
      //         {

      //           $expr:
      //           {
      //             $and: [{ $eq: ['$awbNumber', '$$awbNumber'] }],
      //           },
      //         },
      //       },
      //       { $limit: 1 },
      //       {
      //         $project: {
      //           awbNumber: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $unwind: {
      //     path: '$pr',
      //     preserveNullAndEmptyArrays: false,
      //   },
      // },
      {
        $project: {
          partnerName: 1,
          awbNumber: 1,
          awbDate: 1,
          codFee: '$td.codFee',
          parcelContent: '$prtParcelContent',
          prtParcelValue: '$prtParcelValue',
          tdParcelValue: '$td.parcelValue',
          prtCustPackageId: '$prtCustPackageId',
          tdcustPackage: "$td.custPackage",
          transactionStatusId: '$td.transactionStatusId',
          userIdDriver: '$courierUserId',
          userIdDriverNik: '$podCourierNik',
          userIdDriverName: '$podCourierName',
          userIdUpdatedNik: '$userUpdatedNik',
          userIdUpdatedName: '$userUpdatedName',
          tdUserIdUpdatedNik: "$td.nikAdmin",
          tdUserIdUpdatedName: "$td.adminName",
          dateUpdated: '$history_date',
          tdDateUpdated: "$td.updatedTime",
          prtReferenceNo: 1,
          perwakilan: 1,
          layanan: 1,
          paymentMethod: '$td.paymentMethod',
          supplierInvoiceStatusId: '$td.supplierInvoiceStatusId',
          penerima: 1,
          codNilai: 1,
          lastValidTrackingDateTime: 1,
          lastValidTrackingType: 1,
          tujuanKecamatan: 1,
          prtDestinationCode: '$tujuan',
          manifestTrackingSiteName: '$manifestTrackingSiteName',
          lastValidTrackingSiteName: '$lastValidTrackingSiteName',
          receiverRemark: 1,
          transactionStatus: '$td.transactionstatusname',
          supplierInvoiceStatus: '$td.supplierInvoiceStatusName',
        },
      },
    ];

    console.log(JSON.stringify(q), 'query');
    return coll.aggregate(q);


    // const arrDriver = await this.getUserProps(datas, "driver");
    // const arrUser = await this.getUserProps(datas, "user");
    // console.log(arrUser, "array");
    // for (const d of datas) {
    //   d.transactionStatus = _.get(transactionStatuses.find(x => x.transaction_status_id === d.transactionStatusId && d.transactionStatusId !== 30000), 'status_title') || '-';
    //   d.supplierInvoiceStatus = _.get(transactionStatuses.find(x => x.transaction_status_id === d.supplierInvoiceStatusId), 'status_title') || '-';
    //   // if (d.userIdDriver && arrDriver.length > 0) {
    //   //   d.sigesit = _.get(arrDriver.find(x => x.employee_id === d.userIdDriver.toString()), 'fullname') || '-';
    //   // }

    //   // if (d.userIdUpdated && arrUser.length > 0)
    //   //   d.username = _.get(arrUser.find(x => x.employee_id === d.userIdUpdated.toString()), 'fullname') || '-';
    // }
    // console.log(datas, "datas")

    // console.log(datas);

  }

  static async getNonCodSupplierInvoiceTransactionDetailData(coll, filters) {
    const spartanFilter: any = [{ $eq: ['$awbNumber', '$$awbNumber'] }];
    let allowNullTd = true;
    const filterList: any = [];

    for (const filter of filters) {
      if (filter.field == 'transactionStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ updatedTime: { $gte: d } });
      }

      if (filter.field == 'transactionEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ updatedTime: { $lt: d } });
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        filterList.push({ transactionStatusId: { $eq: filter.value } });
      }

      if (filter.field == 'supplierTMSId' && filter.value) {
        filterList.push({ partnerId: { $eq: filter.value } });
      }


      if (filter.field == 'supplierInvoiceStatus' && filter.value) {
        filterList.push({ supplierInvoiceStatusId: { $eq: filter.value } });
      }

      if (filter.field == 'sigesit' && filter.value) {
        filterList.push({ userIdDriver: { $eq: filter.value } });
      }

      if (filter.field == 'branchLastId' && filter.value) {
        filterList.push({ currentPositionId: { $eq: filter.value } });
      }

      if (filter.field == 'periodStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ $gte: ['$lastValidTrackingDateTime', d] });
        allowNullTd = false;
      }


      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ $lt: ['$lastValidTrackingDateTime', d] });
        allowNullTd = false;
      }

      if (filter.field == 'manifestedStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ awbDate: { $gte: d } });
      }

      if (filter.field == 'manifestedEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ awbDate: { $lt: d } });
      }

      if (filter.field == 'awbStatus' && filter.value) {
        spartanFilter.push({ $eq: ['$lastValidTrackingType', filter.value] });
        allowNullTd = true;
      }
    }

    const q = [
      {
        $match: {
          $and: filterList,
        },
      },
      {
        $lookup: {
          from: 'cod_awb',
          as: 'ca',
          let: { awbNumber: '$awbNumber' },
          pipeline: [
            {
              // on inner join
              $match:
              {
                $expr:
                {
                  $and: spartanFilter,
                },
              },
            },
            { $limit: 1 },
            {
              $project: {
                awbNumber: 1,
                lastValidTrackingType: 1
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$ca',
          preserveNullAndEmptyArrays: allowNullTd,
        },
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
          isDeleted: 1,
          paymentMethod: 1,
          perwakilan: '$representativeCode',
          supplierInvoiceStatusId: 1,
          supplierInvoiceStatus: '$supplierInvoiceStatusName',
          prtParcelValue: '$parcelValue',
          codNilai: '$codValue',
          prtCustPackageId: '$custPackage',
          tdcustPackage: '$custPackage',
          lastValidTrackingDateTime: '$podDate',
          penerima: '$consigneeName',
          receiverRemark: '$parcelNote',
          layanan: '$packageType',
          tujuanKecamatan: '$destination',
          prtDestinationCode: '$destinationCode',
          lastValidTrackingSiteName: '$currentPosition',
          manifestTrackingSiteName: '$pickupSource',
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
          transactionStatus: '$transactionstatusname',
          lastValidTrackingType: '$ca.lastValidTrackingType',
          userIdDriverNik: '$nikSigesit',
          userIdDriverName: '$sigesit',
          userIdUpdatedNik: '$nikAdmin',
          userIdUpdatedName: '$adminName',
          dateUpdated: '$updatedTime',
          updatedTime: 1,
          userIdUpdated: 1,
        },
      },
    ];

    return coll.aggregate(q);

  }

  static async timeResponse(key, promise) {
    const startMoment = moment.utc();
    const response = await promise;
    const endMoment = moment.utc();
    const duration = endMoment.diff(startMoment);

    try {
      const collection = await MongoDbConfig.getDbSicepatCod('time_log_cod');
      await collection.insertOne({
        key,
        startTime: startMoment.toDate(),
        endTime: endMoment.toDate(),
        duration,
      });
    } catch (error) {
      console.error(error);
    }

    return {
      data: response,
      duration,
    };
  }

  static async printNonCodSupplierInvoice(filters, response) {
    // TODO: query get data
    const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    const dbAwb = await MongoDbConfig.getDbSicepatCod('cod_awb');

    let cursor: any;
    try {
      const reportType = await this.reportTypeFromFilter(filters);
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader('Content-disposition', `attachment; filename=${fileName}`);
      response.writeHead(200, { 'Content-Type': 'text/csv' });

      response.flushHeaders();

      response.write(`${this.CodNONFeeHeader.join(',')}\n`);


      // prepare csv file
      try {
        if (reportType.filterTransaction === true && reportType.filterAwb === false) {
          cursor = await this.getNonCodSupplierInvoiceTransactionDetailData(dbTransactionDetail, filters);
        }
        else {
          cursor = await this.getNonCodSupplierInvoiceJoinData(dbAwb, filters);
        }

        const transformer = this.streamTransform;

        cursor.stream({ transform: transformer })
          .pipe(response)

      }
      finally {
        // await writer.on('finish', () => {
        //   writer.end();
        // });
      }

    } catch (err) {
      console.error(err);
      throw err;
    }

  }
  static reportTypeFromFilter(filters: any) {
    let filterAwb = false;
    let filterTransaction = false;

    filters.forEach(filter => {
      if (filter.field == "periodStart" && filter.value) {
        filterAwb = true
      }
      if (filter.field == "periodEnd" && filter.value) {
        filterAwb = true
      }
      // if (filter.field == "supplier" && filter.value) {
      //   filterAwb = true
      // }

      // if (filter.field == "awbStatus" && filter.value) {
      //   filterAwb = true
      // }

      if (filter.field == 'transactionStart' && filter.value) {
        filterTransaction = true;
      }
      if (filter.field == 'transactionEnd' && filter.value) {
        filterTransaction = true;
      }

    });

    // console.log(filters, filterTransaction, filterAwb, 'filters');

    return { filterTransaction, filterAwb };
  }

  //#endregion NON_COD

  //#region COD

  static async getCodSupplierInvoiceData(coll, filters) {
    const filterList: any = [];

    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ updatedTime: { $gte: d } });
      }

      if (filter.field == 'periodEnd' && filter.value) {

        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        filterList.push({ updatedTime: { $lt: d } });
      }

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

    filterList.push({ supplierInvoiceStatusId: { $eq: 45000 } });

    const queryParam = [
      {
        $match: {
          $and: filterList,
        },
      },
      { "$sort": { awbNumber: 1 } },
      {
        $lookup: {
          from: 'cod_awb',
          as: 'ca',
          let: { awbNumber: '$awbNumber' },
          pipeline: [
            {
              // on inner join
              $match:
              {
                $expr:
                {
                  $and: [{
                    $eq: ['$awbNumber', '$$awbNumber'],
                  }],
                },
              },
            },
            { $limit: 1 },
            {
              $project: {
                awbNumber: 1,
              },
            },
          ],
        },
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
          paymentMethod: 1,
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
          transactionStatus: '$transactionstatusname',
          supplierInvoiceStatus: '$supplierInvoiceStatusName',
          perwakilan: '$perwakilanCode',
          userIdDriver: 1,
          updatedTime: 1,
          userIdUpdated: 1,
          userIdDriverNik: '$nikSigesit',
          userIdDriverName: '$sigesit',
          userIdUpdatedNik: '$nikAdmin',
          userIdUpdatedName: '$adminName',
          dateUpdated: '$updatedTime',
        },
      },
    ];
    console.log(JSON.stringify(queryParam), "query param")
    return coll.aggregate(queryParam);
  }

  static async printCodSupplierInvoice(filters, response) {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun ffile/ link downlod

    const dbTransactionDetail = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    let cursor: any;
    try {
      const reportType = await this.reportTypeFromFilter(filters);
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader('Content-disposition', `attachment; filename=${fileName}`);
      response.writeHead(200, { 'Content-Type': 'text/csv' });

      response.flushHeaders();

      response.write(`${this.CodHeader.join(',')}\n`);

      try {
        cursor = await this.getCodSupplierInvoiceData(dbTransactionDetail, filters);


        const transformer = this.streamTransformCodFee;

        cursor.stream({ transform: transformer })
          .pipe(response)

      } finally {

      }

    } catch (err) {
      console.error(err);
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
      // console.log(awsKey, 'uploadpath');
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey
          }`;
        this.deleteFile(csvConfig.filePath);
      }

      return { status: 'ok', url };

    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
