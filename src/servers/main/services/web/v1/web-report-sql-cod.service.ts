import fs = require('fs');
import * as moment from 'moment';
import * as path from 'path';
import _ = require('lodash');

import { AwsS3Service } from '../../../../../shared/services/aws-s3.service';
import { ConfigService } from '../../../../../shared/services/config.service';
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception';
import { BadRequestException } from '@nestjs/common';
import { RedisService } from '../../../../../shared/services/redis.service';
import uuid = require('uuid');
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { createQueryBuilder } from 'typeorm';

export class V1WebReportSqlCodService {
  static expireOnSeconds = 300; // 5 minute

  static async addQueueBullPrint(filters, cod = true, awbFilter = null) {
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();
    const reportKey = `reportKeyCOD:${uuidString}`;

    // send to background process generate report
    // CodExportMongoQueueService.perform(filters, cod, awbFilter, reportKey);

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

  //#region NON_COD
  static async printNonCodSupplierInvoice(filters, uuid: string = '') {

    try {
      // prepare csv file
      const limit = 2000;
      const csvConfig = await this.getCSVConfig(false);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));

      try {
        let pageNumber = 1;
        let datas = [];
        let finish = false;

        while (!finish) {
          const prom1 = this.getNonCodSupplierInvoiceData(datas, filters, limit, pageNumber);
          pageNumber++;
          const prom2 = this.getNonCodSupplierInvoiceData(datas, filters, limit, pageNumber);
          pageNumber++;
          const prom3 = this.getNonCodSupplierInvoiceData(datas, filters, limit, pageNumber);
          pageNumber++;

          await Promise.all([prom1, prom2, prom3]);

          if (!datas || datas.length < (limit * 3)) {
            finish = true;
          }

          await this.populateDataAwbCsv(writer, datas);
          datas = [];
          pageNumber++;

        }
      } finally {
        await writer.on('finish', () => {
          writer.end();
        });
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

  static async getNonCodSupplierInvoiceData(arrDatas: any[], filters, limit, pageNumber) {
    const spartanFilter: any = [{ isCod: true }];
    const siteFilter: any = [{ $eq: ['$id', '$$trackingSiteId'] }];
    const tdFilter: any = [{ $eq: ['$awbNumber', '$$awbNumber'] }];

    let allowNullSite = true;
    let allowNullTd = true;

    const skip = limit * (pageNumber - 1);

    // loop filter
    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $gte: d } });
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment.utc(moment.utc(filter.value).add(1, 'days').format('YYYY-MM-DD 00:00:00')).toDate();
        spartanFilter.push({ lastValidTrackingDateTime: { $lt: d } });
      }

      if (filter.field == 'awbStatus' && filter.value) {
        const fv = (filter.value === 'IN_BRANCH') ? 'IN' : filter.value;
        spartanFilter.push({ lastValidTrackingType: { $eq: fv } });
      }

      if (filter.field == 'supplier' && filter.value) {
        const regex = new RegExp(`^${filter.value.toLowerCase()}`, 'i');
        spartanFilter.push({ partnerName: regex });
      }

      if (filter.field == 'branchLast' && filter.value) {
        siteFilter.push({ $eq: ['$siteCode', filter.value] });
        allowNullSite = false;
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        tdFilter.push({ $eq: ['$transactionStatusId', filter.value] });
        allowNullTd = false;
      }

      if (filter.field == 'supplierInvoiceStatus' && filter.value) {
        tdFilter.push({ $eq: ['$supplierInvoiceStatusId', filter.value] });
        allowNullTd = false;
      }
    }

    const datas = []; // await query.toArray();

    arrDatas.push(...datas);
    return datas;
  }
  //#endregion NON_COD

  //#region COD [OK]

  static async printCodSupplierInvoice(filters, uuid: string = '') {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun ffile/ link downlod

    try {
      // prepare csv file
      const limit = 2000;
      const csvConfig = await this.getCSVConfig(true);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      try {

        let pageNumber = 1;
        let finish = false;
        while (!finish) {
          const responseDatas = await this.getCodSupplierInvoiceData(filters, limit, pageNumber);
          if (responseDatas.length < limit) {
            finish = true;
          }
          await this.populateDataCsv(writer, responseDatas, true);

          pageNumber++;
        }
      } finally {
        await writer.on('finish', () => {
          writer.end();
        });
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

  private static async getCodSupplierInvoiceData(filters, limit, pageNumber) {
    const qb = createQueryBuilder();
    const skip = limit * (pageNumber - 1);

    qb.addSelect('t1.partner_name', 'partnerName');
    qb.addSelect('t1.awb_date', 'awbDate');
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.parcel_value', 'parcelValue');
    qb.addSelect('t1.cod_value', 'codValue');
    qb.addSelect('t1.cod_fee', 'codFee');
    qb.addSelect('t1.pod_date', 'podDate');
    qb.addSelect('t1.consignee_name', 'consigneeName');
    qb.addSelect('t1.cust_package', 'custPackage');
    qb.addSelect('t1.pickup_source', 'pickupSource');
    qb.addSelect('t1.current_position', 'currentPosition');
    qb.addSelect('t1.destination_code', 'destinationCode');
    qb.addSelect('t1.destination', 'destination');
    qb.addSelect('t1.parcel_content', 'parcelContent');
    qb.addSelect('t1.package_type', 'packageType');
    qb.addSelect('t1.parcel_note', 'parcelNote');

    qb.from('cod_transaction_detail', 't1');
    qb.where('t1.supplier_invoice_status_id = :supplierInvoiceStatusId', {
      supplierInvoiceStatusId: 45000,
    });
    qb.andWhere('t1.is_deleted = false');
    // loop filter
    for (const filter of filters) {
      // local time
      if (filter.field == 'periodStart' && filter.value) {
        qb.andWhere('t1.updated_time >= :periodStart', {
          periodStart: moment(filter.value).format('YYYY-MM-DD HH:mm:ss'),
        });
      }

      if (filter.field == 'periodEnd' && filter.value) {
        qb.andWhere('t1.updated_time < :periodEnd', {
          periodEnd: moment(filter.value).format('YYYY-MM-DD HH:mm:ss'),
        });
      }

      if (filter.field == 'supplier' && filter.value) {
        qb.andWhere('t1.partner_id = :partnerId', {
          partnerId: Number(filter.value),
        });
      }
    }
    qb.skip(skip);
    qb.take(limit);
    const datas = await qb.getRawMany();
    console.log(datas.length, 'data array');
    return datas;
  }

  //#endregion COD

  // export report draft invoice
  static async exportSupplierInvoice(codSupplierInvoiceId: string) {
    try {
      // prepare csv file
      const limit = 2000;
      const csvConfig = await this.getCSVConfig(true);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      try {
        let pageNumber = 1;
        let finish = false;
        while (!finish) {
          const responseDatas = await this.getDataSupplierInvoice(
            codSupplierInvoiceId,
            limit,
            pageNumber,
          );
          if (responseDatas.length < limit) {
            finish = true;
          }
          await this.populateDataCsv(writer, responseDatas, true, true);

          pageNumber++;
        }
      } finally {
        await writer.on('finish', () => {
          writer.end();
        });
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
      return { status: 'ok', url };
    } catch (err) {
      console.error(err);
      throw new ServiceUnavailableException(err.message);
    }
  }

  private static async getDataSupplierInvoice(
    codSupplierInvoiceId: string,
    limit: number,
    pageNumber: number,
  ) {
    const qb = createQueryBuilder();
    const skip = limit * (pageNumber - 1);

    qb.addSelect('t1.partner_name', 'partnerName');
    qb.addSelect('t1.awb_date', 'awbDate');
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.parcel_value', 'parcelValue');
    qb.addSelect('t1.cod_value', 'codValue');
    qb.addSelect('t1.cod_fee', 'codFee');
    qb.addSelect('t1.pod_date', 'podDate');
    qb.addSelect('t1.consignee_name', 'consigneeName');
    qb.addSelect('t1.cust_package', 'custPackage');
    qb.addSelect('t1.pickup_source', 'pickupSource');
    qb.addSelect('t1.current_position', 'currentPosition');
    qb.addSelect('t1.destination_code', 'destinationCode');
    qb.addSelect('t1.destination', 'destination');
    qb.addSelect('t1.parcel_content', 'parcelContent');
    qb.addSelect('t1.package_type', 'packageType');
    qb.addSelect('t1.parcel_note', 'parcelNote');

    qb.from('cod_transaction_detail', 't1');
    qb.where('t1.cod_supplier_invoice_id = :codSupplierInvoiceId', {
      codSupplierInvoiceId,
    });
    qb.andWhere('t1.supplier_invoice_status_id = :supplierInvoiceStatusId', {
      supplierInvoiceStatusId: TRANSACTION_STATUS.DRAFT_INV,
    });
    qb.andWhere('t1.is_deleted = false');
    qb.skip(skip);
    qb.take(limit);
    return await qb.getRawMany();
  }

  // #region private ==================================================================

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

  private static async populateDataAwbCsv(
    writer, data,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate
            ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm')
            : null,
          this.strReplaceFunc(d.awbNumber),
          d.prtParcelValue,
          d.codNilai,
          d.codNilai,
          d.lastValidTrackingDateTime
            ? moment.utc(d.lastValidTrackingDateTime).format('YYYY-MM-DD HH:mm')
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

  // COD Fee
  private static async populateDataCsv(
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
            d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD') : null,
            this.strReplaceFunc(d.awbNumber),
            d.parcelValue,
            d.codValue,
            d.codFee,
            d.codValue,
            d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
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
              ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm')
              : null,
            this.strReplaceFunc(d.awbNumber),
            d.parcelValue,
            d.codValue,
            d.codValue,
            d.podDate
              ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm')
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

  private static sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  private static strReplaceFunc = str => {
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

  // #endregion
}
