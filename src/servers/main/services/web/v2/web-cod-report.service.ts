import fs = require('fs');
import * as moment from 'moment';
import * as path from 'path';
import _ = require('lodash');
import { AwsS3Service } from '../../../../../shared/services/aws-s3.service';
import { ConfigService } from '../../../../../shared/services/config.service';
import { MongoDbConfig } from '../../../config/database/mongodb.config';
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception';
import { BadRequestException } from '@nestjs/common';
import { BaseMetaPayloadFilterVm } from '../../../../../shared/models/base-meta-payload.vm';

export class V2WebCodReportService {
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
  ];

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
    'Status Invoice',
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
  ];

  // csv file code
  static async getCSVConfig(cod = true) {
    const csvHeaders: any = cod
      ? [
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
      : [
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

    const csvConfig = cod
      ? this.prepareCsvFile('COD', csvHeaders)
      : this.prepareCsvFile('COD_nonfee', csvHeaders);
    return csvConfig;
  }

  // TODO: add params for custom name file
  static prepareCsvFile(fn, headers): any {
    const appRoot = require('app-root-path');
    const uuidv1 = require('uuid/v1');
    const fileName =
      moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const basePath = path.join(appRoot.path, 'dist/public/temps');
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

  static async populateDataCsv(
    writer,
    data,
    cod,
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
          (d.userIdDriverNik ? d.userIdDriverNik : '') +
            ' - ' +
            (d.userIdDriverName ? d.userIdDriverName : ''),
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.packageType),
          this.strReplaceFunc(d.parcelNote),
          '',
          '',
          d.dateUpdated
            ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm')
            : null,
          (d.userIdUpdatedNik ? this.strReplaceFunc(d.userIdUpdatedNik) : '') +
            ' - ' +
            (d.userIdUpdatedName
              ? this.strReplaceFunc(d.userIdUpdatedName)
              : ''),
        ]);
      }
      count += 1;
    } // end of while
    writer.on('data', chunk => {
      // console.log(`Received ${chunk.length} bytes of data.`);
    });

    await this.sleep(100);
    return true;
  }

  static streamTransform(doc) {
    const values = [
      V2WebCodReportService.strReplaceFunc(doc.partnerName),
      doc.awbDate ? moment.utc(doc.awbDate).format('YYYY-MM-DD HH:mm') : null,
      `'${doc.awbNumber}`,
      doc.tdParcelValue ? doc.tdParcelValue : doc.prtParcelValue,
      doc.codNilai,
      doc.codFee ? doc.codFee : '-',
      doc.codNilai,
      doc.lastValidTrackingDateTime
        ? moment.utc(doc.lastValidTrackingDateTime).format('YYYY-MM-DD HH:mm')
        : null,
      V2WebCodReportService.strReplaceFunc(doc.penerima),
      doc.paymentMethod,
      doc.transactionStatus,
      doc.lastValidTrackingType,
      doc.supplierInvoiceStatus,
      V2WebCodReportService.strReplaceFunc(
        doc.tdcustPackage ? doc.tdcustPackage : doc.prtReferenceNo,
      ),
      V2WebCodReportService.strReplaceFunc(doc.manifestTrackingSiteName),
      V2WebCodReportService.strReplaceFunc(doc.lastValidTrackingSiteName),
      V2WebCodReportService.strReplaceFunc(doc.prtDestinationCode),
      V2WebCodReportService.strReplaceFunc(doc.tujuanKecamatan),
      V2WebCodReportService.strReplaceFunc(doc.perwakilan),
      (doc.userIdDriverNik ? doc.userIdDriverNik : '') +
        ' - ' +
        (doc.userIdDriverName ? doc.userIdDriverName : ''),
      V2WebCodReportService.strReplaceFunc(doc.parcelContent),
      V2WebCodReportService.strReplaceFunc(doc.layanan),
      V2WebCodReportService.strReplaceFunc(doc.receiverRemark),
      '',
      '',
      doc.tdDateUpdated
        ? moment.utc(doc.tdDateUpdated).format('YYYY-MM-DD HH:mm')
        : doc.dateUpdated
        ? moment.utc(doc.dateUpdated).format('YYYY-MM-DD HH:mm')
        : null,
      doc.tdUserIdUpdatedNik
        ? V2WebCodReportService.strReplaceFunc(doc.tdUserIdUpdatedNik) +
          ' - ' +
          doc.tdUserIdUpdatedName
        : doc.userIdUpdatedNik
        ? V2WebCodReportService.strReplaceFunc(doc.userIdUpdatedNik) +
          ' - ' +
          doc.userIdUpdatedName
        : '-',
    ];

    return `${values.join(',')} \n`;
  }

  static streamTransformCodFee(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD') : null,
        V2WebCodReportService.strReplaceFunc(d.awbNumber),
        d.parcelValue,
        d.codValue,
        d.codFee,
        d.codValue,
        d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
        V2WebCodReportService.strReplaceFunc(d.consigneeName),
        V2WebCodReportService.strReplaceFunc(d.paymentMethod),
        'PAID', // supplier invoice status
        'DLV',
        V2WebCodReportService.strReplaceFunc(d.custPackage),
        V2WebCodReportService.strReplaceFunc(d.pickupSource),
        V2WebCodReportService.strReplaceFunc(d.currentPosition),
        V2WebCodReportService.strReplaceFunc(d.destinationCode),
        V2WebCodReportService.strReplaceFunc(d.destination),
        d.perwakilan,
        (d.userIdDriverNik ? d.userIdDriverNik : '') +
          ' - ' +
          (d.userIdDriverName ? d.userIdDriverName : ''),
        V2WebCodReportService.strReplaceFunc(d.parcelContent),
        V2WebCodReportService.strReplaceFunc(d.packageType),
        V2WebCodReportService.strReplaceFunc(d.parcelNote),
        '',
        '',
        d.dateUpdated
          ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm')
          : null,
        (d.userIdUpdatedNik
          ? V2WebCodReportService.strReplaceFunc(d.userIdUpdatedNik)
          : '') +
          ' - ' +
          (d.userIdUpdatedName
            ? V2WebCodReportService.strReplaceFunc(d.userIdUpdatedName)
            : ''),
      ],
    ];

    return `${values.join(',')} \n`;
  }

  static sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  private strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
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

  static async getReportData(
    filters: BaseMetaPayloadFilterVm[],
    reportType: 'noncodfee' | 'codfee',
  ) {
    // TODO: Query get data
  }

  static async printNonCodSupplierInvoice(
    filters: BaseMetaPayloadFilterVm[],
    response,
  ) {
    try {
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodNONFeeHeader.join(',')}\n`);

      const cursor: any = await this.getReportData(filters, 'noncodfee');
      const transformer = this.streamTransform;
      cursor.stream({ transform: transformer }).pipe(response);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async printCodSupplierInvoice(
    filters: BaseMetaPayloadFilterVm[],
    response,
  ) {
    try {
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodHeader.join(',')}\n`);

      const cursor: any = await this.getReportData(filters, 'codfee');
      const transformer = this.streamTransformCodFee;
      cursor.stream({ transform: transformer }).pipe(response);
    } catch (err) {
      console.error(err);
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
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));

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
