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

export class V1WebReportCodService {
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
          awbDate: {
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

      if (filter.field == 'sigesit' && filter.value) {
        const f = {
          userIdDriver: { $eq: filter.value },
        };

        filterList.push(f);
      }

      if (filter.field == 'status' && filter.value) {
        const f = {
          transactionStatusId: { $eq: filter.value.toString() },
        };

        filterList.push(f);
      }
    });
    console.log(filterList, 'filter list');
    return filterList;
  }

  // csv file code
  static async getCSVConfig(cod = true) {
    console.log(cod, 'getCSVConfig');
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
  ): Promise<boolean> {
    let count = 0;
    // console.log(data);
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
            'DLV', // supplier invoice status
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
      console.log(`Received ${chunk.length} bytes of data.`);
    });

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
  static async  printSupplierInvoice(payload, filters, cod = true) {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun file/ link downlod
    console.log(JSON.stringify({ ...filters }), 'filter');

    const dbMongo = await MongoDbConfig.getDbSicepatCod('transaction_detail');

    try {
      const datarow = await dbMongo.aggregate([
        {
          $match: {
            $and: filters,
          },
        },
        {
          $project: {
            _id: 1,
            awbDate: 1,
            awbNumber: 1,
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

      const dataRowCount = await datarow.toArray();
      if (!datarow || datarow.length <= 0) {
        return null;
      }

      console.log(dataRowCount, 'data row count');
      const csvConfig = await this.getCSVConfig(cod);
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
      const limit = 5000;

      const totalPaging = Math.ceil(dataRowCount.length / limit);

      console.log(totalPaging, dataRowCount.length, 'start writing');

      if (dataRowCount.length > 1048576) {
        throw new Error('Tidak dapat menarik data. Jumlah data yang ditarik lebih dari 1 jt.');
      }

      for (let index = 0; index < totalPaging; index++) {
        console.log(limit * (index), limit);
        await this.populateDataCsv(writer, await datarow.skip(limit * (index)).limit(limit).toArray(), cod);
      }
      writer.end();

      let url = '';
      const awsKey = `reports/testing/${csvConfig.fileName}`;
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey}`;
        this.deleteFile(csvConfig.filePath);
      }

      return { status: 'OK', url };
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

      await this.populateDataCsv(writer, datarow, true);
      writer.end();

      let url = '';
      const awsKey = `reports/testing/${csvConfig.fileName}`;
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
