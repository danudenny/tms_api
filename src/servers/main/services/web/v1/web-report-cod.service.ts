import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import fs = require('fs');
import * as path from 'path';
import { AwsS3Service } from '../../../../../shared/services/aws-s3.service';
import { ConfigService } from '../../../../../shared/services/config.service';

export class V1WebReportCodService {

  static async testExport() {
    // TODO: query get data
    // step 1 : query get data by filter
    // prepare generate csv
    // ??upload file csv to aws s3
    // retrun file/ link download

    const csvHeaders: string[] = [
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
    ];

    const csvConfig = await this.prepareCsvFile('TESTCSV', csvHeaders);
    // backgroud job process
    // GenerateReportQueueService.createReportJob(payload);
    const generateData = await this.populateDataCsv(csvConfig);
    console.log('#### generateData :: ', generateData);

    // const q = await this.getDataAwbCancel(payload);
    let url = '';
    if (generateData) {
      // upload report to S3
      const awsKey = `testing/${csvConfig.fileName}`;
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        // send mail with url path download file
        // SendGridService.testSendEmail(storagePath);
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey}`;
        // this.deleteFile(csvConfig.filePath);
      }
    }

    // return test url
    return {
      status: 'ok',
      url,
    };
  }

  // private ==================================================================
  private static async populateDataCsv(
    csvConfig,
  ): Promise<boolean> {
    const csvWriter = require('csv-write-stream');
    const writer = csvWriter(csvConfig.config);
    const limit = 2500;
    let isFinish: boolean = false;
    let page: number = 1;
    writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));
    try {
      // TODO: add filter query ??
      // put query on private method
      const q =
        'select partner, awb_date, awb, package_amount, cod_amount, cod_fee, amount_transfer, pod_datetime, recipient, status_internal, tracking_status, cust_package, pickup_source, current_position, destination_code, destination, package_detail, services,note,submitted_date,submitted_number from test_export_data';
      const totalData = await RawQueryService.queryCount(q);

      if (totalData > 1048576) {
        throw new Error('Tidak dapat menarik data. Jumlah data yang ditarik lebih dari 1 jt.');
      }

      while (!isFinish) {
        const [data, paginate ] = await RawQueryService.queryWithPaginate(
          q, page, limit, totalData,
        );

        if (data) {
          for (const d of data) {
            // writer.write(d);
            writer.write([
              d.partner,
              d.awb_date,
              d.awb,
              d.package_amount,
              d.cod_amount,
              d.cod_fee,
              d.amount_transfer,
              d.pod_datetime,
              d.recipient,
              d.status_internal,
              d.tracking_status,
              d.cust_package,
              d.pickup_source,
              d.current_position,
              d.destination_code,
              d.destination,
              d.package_detail,
              d.services,
              d.note,
              d.submitted_date,
              d.submitted_number,
            ]);
          }
          // checlastk paginate data
          if (paginate.totalPage == page) {
            isFinish = true;
          } else {
            page += 1; // next page
          }
        }
      } // end of while
      writer.on('data', chunk => {
        console.log(`Received ${chunk.length} bytes of data.`);
      });

      writer.end('There will be no more data.');
    } catch (error) {
      throw error;
    } finally {
      writer.on('finish', () => {
        console.log('All writes are now complete.');
      });
    }
    return true;
  }
  private static prepareCsvFile(fn, headers): any {
    const appRoot = require('app-root-path');
    const uuidv1 = require('uuid/v1');

    const basePath = path.join(appRoot.path, 'dist/public/temps');
    // NOTE: Test only
    const fileName = `${fn}.csv`; // moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const filePath = basePath + '/' + fileName;
    const urlPath = 'public/temps/' + fileName;

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const csvConfig: any = {
      headers,
      separator: ';',
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
}
