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
import { RawQueryService } from 'src/shared/services/raw-query.service';
import { CodSqlExportMongoQueueService } from 'src/servers/queue/services/cod/cod-sql-export-queue.service';

export class V1WebReportSqlCodService {
  static expireOnSeconds = 300; // 5 minute

  static async addQueueBullPrint(filters, noncodfee) {
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();
    const reportKey = `reportKeySqlCOD:${uuidString}`;

    // send to background process generate report
    CodSqlExportMongoQueueService.perform(filters, noncodfee, uuidString);

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
    let sWhere: string = "";
    let allowNullSite = true;
    let allowNullTd = true;

    const skip = limit * (pageNumber - 1);


    for (const filter of filters) {
      // local time
      if (filter.field == 'periodStart' && filter.value) {
        const dateFormat = moment(filter.value).format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND t1.updated_time >= '${dateFormat}'`;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const dateFormat = moment(filter.value).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND t1.updated_time < '${dateFormat} \n'`;
      }

      // local time
      if (filter.field == 'transactionStart' && filter.value) {
        const dateFormat = moment(filter.value).format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND ctd.updated_time >= '${dateFormat}'`;
      }

      if (filter.field == 'transactionEnd' && filter.value) {
        const dateFormat = moment(filter.value).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND ctd.updated_time < '${dateFormat} \n'`;
      }

      if (filter.field == 'supplier' && filter.value) {
        sWhere += ` AND ctd.partner_id = ${filter.value} \n`;
      }

      if (filter.field == 'awbStatus' && filter.value) {
        sWhere += ` AND t1.awb_status_id_last = ${filter.value} \n`;
      }

      if (filter.field == 'branchLast' && filter.value) {
        sWhere += ` AND t1.branch_id_last = ${filter.value} \n`;
      }

      if (filter.field == 'transactionStatus' && filter.value) {
        sWhere += ` AND ctd.transaction_status_id = ${filter.value} \n`;
      }

      if (filter.field == 'sigesit' && filter.value) {
        sWhere += ` AND ctd.user_id_driver = ${filter.value} \n`;
      }

      if (filter.field == 'supplierInvoiceStatus' && filter.value) {
        sWhere += ` AND ctd.supplier_invoice_status_id = ${filter.value} \n`;
      }
    }

    let q = `SELECT "t3"."notes" AS "parcelNote", "t4"."reference_no" AS "custPackage", "t4"."partner_id" AS "partnerId", 
    t1.awb_item_id AS "awbItemId", t1.awb_number AS "awbNumber", t1.branch_id_last AS "currentPositionId",
    t7.branch_name AS "currentPosition", t1.awb_status_id_last AS "awbStatusIdLast", t1.awb_history_date_last AS "podDate",
    t2.awb_date AS "awbDate", t2.ref_destination_code AS "destinationCode", t2.to_id AS "destinationId",
    t9.district_name AS "destination", t2.package_type_id AS "packageTypeId", t5.package_type_code AS "packageTypeCode",
    t5.package_type_name AS "packageTypeName", t2.branch_id_last AS "pickupSourceId", t8.branch_name AS "pickupSource",
    t2.total_weight_real_rounded AS "weightRealRounded", t2.total_weight_final_rounded AS "weightFinalRounded", t2.consignee_name AS "consigneeName",      
    t3.parcel_value AS "parcelValue", t3.cod_value AS "codValue", t3.parcel_content AS "parcelContent", t6.partner_name AS "partnerName", 
    ctd.transaction_status_id AS "transactionStatusId", ctd.supplier_invoice_status_id AS "supplierInvoiceStatusId", 
    ctd.user_id_driver  "userIdDriver", concat(edriverUser.nik,  ' - ',edriverUser.fullname) driver,
    ctd.user_id_updated  "userIdUpdated", concat(eupdUser.nik,  ' - ', eupdUser.fullname) "updUser", ctd.updated_time "updatedTime", ts.status_title  "transactionStatus",
    ctd.payment_method, awbStatus.status_title awbStatus, branres.representative_code "perwakilan", statusInvoice.status_title "statusInvoice"
    FROM "public"."awb_item_attr" "t1"
    INNER JOIN "public"."awb" "t2" ON t1.awb_id = t2.awb_id AND t2.is_deleted = false
    INNER JOIN "public"."pickup_request_detail" "t3" ON t1.awb_item_id = t3.awb_item_id AND t3.is_deleted = false
    INNER JOIN "public"."pickup_request" "t4" ON t3.pickup_request_id = "t4"."pickup_request_id" AND t4.is_deleted = false
    INNER JOIN "public"."package_type" "t5" ON t2.package_type_id = t5.package_type_id AND t5.is_deleted = false
    INNER JOIN "public"."partner" "t6" ON "t4"."partner_id" = "t6"."partner_id" AND t6.is_deleted = false
    INNER JOIN "public"."branch" "t7" ON t1.branch_id_last = t7.branch_id AND t7.is_deleted = FALSE
    LEFT JOIN transaction_status awbStatus ON awbStatus.transaction_status_id  = "t1".transaction_status_id 
    LEFT JOIN representative branres ON branres.representative_id = "t7".representative_id 
    LEFT JOIN cod_transaction_detail ctd ON ctd.awb_item_id  = "t1".awb_item_id AND ctd.is_deleted  = false 
    LEFT JOIN transaction_status ts ON ts.transaction_status_id  = ctd.transaction_status_id AND ts.is_deleted  = false 
    LEFT JOIN transaction_status statusInvoice ON statusinvoice.transaction_status_id  = ctd.supplier_invoice_status_id AND statusinvoice.is_deleted  = false 
    LEFT JOIN users upduser ON upduser.user_id  = ctd.user_id_updated  AND upduser.is_deleted  = false 
    LEFT JOIN employee eupdUser ON eupdUser.employee_id  = upduser.employee_id AND eupdUser.is_deleted  = false 
    LEFT JOIN users driverUser ON driverUser.user_id  = ctd.user_id_driver  AND driverUser.is_deleted  = false 
    LEFT JOIN employee edriverUser ON edriverUser.employee_id  = driverUser.employee_id AND edriverUser.is_deleted  = false
    LEFT JOIN "public"."branch" "t8" ON t2.branch_id_last = t8.branch_id AND t8.is_deleted = false
    LEFT JOIN "public"."district" "t9" ON t2.to_id = t9.district_id AND t8.is_deleted = false
              WHERE  t1.is_deleted = FALSE AND "t2".is_cod = true `;

    // where transaction
    if (sWhere != "") {
      q += sWhere
    }

    q += ` OFFSET ${skip} LIMIT ${limit}`


    // loop filter

    const datas = await RawQueryService.query(q);

    arrDatas.push(...datas);
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
    const skip = limit * (pageNumber - 1);

    let sWhere: string = "";

    for (const filter of filters) {
      // local time
      if (filter.field == 'periodStart' && filter.value) {
        const dateFormat = moment(filter.value).format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND t1.updated_time >= '${dateFormat}'`;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const dateFormat = moment(filter.value).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        sWhere += ` AND t1.updated_time < '${dateFormat} \n'`;
      }

      if (filter.field == 'supplier' && filter.value) {
        sWhere += ` AND t1.partner_id = ${filter.value} \n`;
      }
    }

    let q = `SELECT "t3"."notes" AS "parcelNote", "t4"."reference_no" AS "custPackage", "t4"."partner_id" AS "partnerId", 
              t1.awb_item_id AS "awbItemId", t1.awb_number AS "awbNumber", t1.branch_id_last AS "currentPositionId", 
              t7.branch_name AS "currentPosition", t1.awb_status_id_last AS "awbStatusIdLast", t1.awb_history_date_last AS "podDate", 
              t2.awb_date AS "awbDate", t2.ref_destination_code AS "destinationCode", t2.to_id AS "destinationId", 
              t9.district_name AS "destination", t2.package_type_id AS "packageTypeId", t5.package_type_code AS "packageTypeCode", 
              t5.package_type_name AS "packageTypeName", t2.branch_id_last AS "pickupSourceId", t8.branch_name AS "pickupSource", 
              t2.total_weight_real_rounded AS "weightRealRounded", t2.total_weight_final_rounded AS "weightFinalRounded", t2.consignee_name AS "consigneeName",
              t3.parcel_value AS "parcelValue", t3.cod_value AS "codValue", t3.parcel_content AS "parcelContent", t6.partner_name AS "partnerName",
              ctd.user_id_driver  "userIdDriver", concat(edriverUser.nik,  ' - ',edriverUser.fullname) driver,
              ctd.user_id_updated  "userIdUpdated", concat(eupdUser.nik,  ' - ', eupdUser.fullname) "updUser", 
              ctd.updated_time "updatedTime",  branres.representative_code "perwakilan" , ctd.payment_method "paymentMethod"
              FROM "public"."awb_item_attr" "t1" 
              INNER JOIN "public"."awb" "t2" ON t1.awb_id = t2.awb_id AND t2.is_deleted = false  
              INNER JOIN "public"."pickup_request_detail" "t3" ON t1.awb_item_id = t3.awb_item_id AND t3.is_deleted = false  
              INNER JOIN "public"."pickup_request" "t4" ON t3.pickup_request_id = "t4"."pickup_request_id" AND t4.is_deleted = false  
              INNER JOIN "public"."package_type" "t5" ON t2.package_type_id = t5.package_type_id AND t5.is_deleted = false  
              INNER JOIN "public"."partner" "t6" ON "t4"."partner_id" = "t6"."partner_id" AND t6.is_deleted = false  
              INNER JOIN "public"."branch" "t7" ON t1.branch_id_last = t7.branch_id AND t7.is_deleted = false  
              INNER JOIN cod_transaction_detail ctd ON ctd.awb_item_id  = "t1".awb_item_id 
              INNER JOIN cod_transaction ct  ON ct.cod_transaction_id = ctd.cod_transaction_id 
              LEFT JOIN representative branres ON branres.representative_id = "t7".representative_id 
              LEFT JOIN users upduser ON upduser.user_id  = ctd.user_id_updated  AND upduser.is_deleted  = false 
              LEFT JOIN employee eupdUser ON eupdUser.employee_id  = upduser.employee_id AND eupdUser.is_deleted  = false 
              LEFT JOIN users driverUser ON driverUser.user_id  = ctd.user_id_driver  AND driverUser.is_deleted  = false 
              LEFT JOIN employee edriverUser ON edriverUser.employee_id  = driverUser.employee_id AND edriverUser.is_deleted  = false
              LEFT JOIN "public"."branch" "t8" ON t2.branch_id_last = t8.branch_id AND t8.is_deleted = false  
              LEFT JOIN "public"."district" "t9" ON t2.to_id = t9.district_id AND t8.is_deleted = false 
              WHERE t1.is_deleted = FALSE `;

    // where transaction
    if (sWhere != "") {
      q += sWhere
    }
    q += ` OFFSET ${skip} LIMIT ${limit}`

    const datas = await RawQueryService.query(q);

    console.log(datas.length, "query datas")
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
    console.log(cod, "cod status")
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

  private static async populateDataAwbCsv(
    writer, data,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.awbNumber),
          d.parcelValue,
          d.codValue,
          d.codValue * 0.01,
          d.codValue,
          d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.consigneeName),
          d.paymentMethod,
          d.transactionStatus,
          d.awbStatus,
          d.statusInvoice,
          this.strReplaceFunc(d.custPackage),
          this.strReplaceFunc(d.pickupSource),
          this.strReplaceFunc(d.currentPosition),
          this.strReplaceFunc(d.destinationCode),
          this.strReplaceFunc(d.destination),
          this.strReplaceFunc(d.perwakilan),
          this.strReplaceFunc(d.driver),
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.packageType),
          this.strReplaceFunc(d.parcelNote),
          '',
          '',
          d.updatedTime ? moment.utc(d.updatedTime).format('YYYY-MM-DD HH:mm') : null,
          d.updUser
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
            d.paymentMethod,
            draft ? 'DRAFT INVOICE' : 'PAID', // supplier invoice status
            'DLV',
            this.strReplaceFunc(d.custPackage),
            this.strReplaceFunc(d.pickupSource),
            this.strReplaceFunc(d.currentPosition),
            this.strReplaceFunc(d.destinationCode),
            this.strReplaceFunc(d.destination),
            this.strReplaceFunc(d.perwakilan),
            this.strReplaceFunc(d.driver),
            this.strReplaceFunc(d.parcelContent),
            this.strReplaceFunc(d.packageType),
            this.strReplaceFunc(d.parcelNote),
            '', '',
            d.updatedTime ? moment.utc(d.updatedTime).format('YYYY-MM-DD HH:mm') : null,
            d.updUser
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
