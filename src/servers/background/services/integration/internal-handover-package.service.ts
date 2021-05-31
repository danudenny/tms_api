import { DropCashlessVm, DropCashLessResponseVM, DropPickupRequestResponseVM, DropCreateWorkOrderPayloadVM, CheckDataDropPartnerVm, DropSuccessResponseVm } from '../../models/partner/fastpay-drop.vm';
import moment = require('moment');
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { WorkOrderDetail } from '../../../../shared/orm-entity/work-order-detail';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';
import { In } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckSpkVm, CheckSpkResponseVM, CheckSpkPayloadVm } from '../../models/partner/diva.vm';
import { DeleteTaxResponseVM, DeteleTaxPayloadVm, UpdateTaxPayloadVm, UpdateTaxResponseVM } from '../../models/partner/internal-tms.vm';
import { ConfigService } from '../../../../shared/services/config.service';
import fs = require('fs');
import * as path from 'path';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { SendgridService } from '../../../../shared/services/sendgrid.service';

export class InternalHandoverPackageService {
  public static async exportHandoverSigesit(payload: any) {
      const year = moment().format("YYYY");
      const month = moment().format("MM");
      const day = moment().format("DD");
      const timeNow = moment().format("HHmm");
      const csvConfig = await this.getCSVConfig();
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));

      const limit = 2000;
      let page = 0;
      let writing = true;
      try {
        while (writing) {
          const skipLimitQuery = `OFFSET ${page * limit} LIMIT ${limit}`;
          const query = this.queryDetail(skipLimitQuery);

          const dataResult = await RawQueryService.query(query);
          if (dataResult.length < 10) {
            writing = false;
          }
          page++;
          await this.populateDataCsv(writer, dataResult);
        }
      } finally {
        await writer.on('finish', () => {
          writer.end();
        });
      }
      let url = '';
      const awsKey = `reports/handover_sigesit/${year}/${month}/${day}/${timeNow}/${csvConfig.fileName}`;
      console.log(awsKey);
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );
      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${storagePath.awsKey}`;
        this.deleteFile(csvConfig.filePath);
      }
      const emailSetting = await this.emailSetting(url);
      return emailSetting;
  }

  static queryDetail(extQuery) {
    let today = moment().format('YYYY-MM-DD 00:00:00');
    let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
    
    return `SELECT hp.handover_package_id,
        TO_CHAR(hp.handover_package_date,'DD-Mon-YYYY HH24:MI:SS') as handover_package_date,
        hp.handover_package_code,
        b.branch_name,
        COALESCE(e.fullname,u.first_name) as name,
        COALESCE(e2.fullname,u2.first_name) as driver_name,
        ca.customer_account_name,
        pr.pickup_request_name as merchant_name,
        pr.pickup_request_contact_no,
        pr.pickup_request_address,
        hpd.awb_number,
        COALESCE(prd.delivery_type,'-') as delivery_type
    FROM handover_package hp 
    INNER JOIN handover_package_detail hpd ON hp.handover_package_id=hpd.handover_package_id AND hpd.is_deleted=false 
    INNER JOIN branch b ON hp.branch_id=b.branch_id AND b.is_deleted=false 
    INNER JOIN users u ON hp.user_id=u.user_id AND u.is_deleted=false 
    LEFT JOIN employee e ON u.employee_id=e.employee_id AND e.is_deleted=false 
    LEFT JOIN pickup_request_detail prd ON hpd.work_order_id=prd.work_order_id_last AND prd.is_deleted=false 
    LEFT JOIN pickup_request pr on pr.pickup_request_id=prd.pickup_request_id AND pr.is_deleted=false 
    LEFT JOIN partner p on pr.partner_id=p.partner_id AND p.is_deleted=false 
    LEFT JOIN customer_account ca on p.customer_account_id=ca.customer_account_id
    LEFT JOIN work_order w ON hpd.work_order_id=w.work_order_id AND w.is_deleted=false 
    INNER JOIN users u2 ON w.employee_id_handover=u2.user_id AND u2.is_deleted=false 
    LEFT JOIN employee e2 ON e2.employee_id=w.employee_id_handover AND e2.is_deleted=false
    WHERE hp.handover_package_date >= '${yesterday}' AND  hp.handover_package_date < '${today}' AND hp.is_deleted=false 
    ORDER BY handover_package_date DESC
    ${extQuery}`;
  }

  static async getCSVConfig() {
    let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const csvHeaders: any = [
      'Tgl Handover Barang',
      'Kode Tanda Terima',
      'Cabang Penerima',
      'Admin Penerima',
      'Sigesit',
      'Customer',
      'Merchant',
      'Telp Seller',
      'Alamat',
      'Resi',
      'Jenis Layanan',
    ];
    const csvConfig =
      this.prepareCsvFile(`List Handover Sigesit [${yesterday}]`, csvHeaders);
    return csvConfig;
  }

  public static async populateDataCsv(
    writer, data,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        // writer.write(d);
        writer.write([
          d.handover_package_date,
          d.handover_package_code,          
          d.branch_name,
          d.name,
          d.driver_name,
          d.customer_account_name,
          d.merchant_name,
          d.pickup_request_contact_no,
          d.pickup_request_address,
          d.awb_number,
          d.delivery_type,
        ]);
      }
      count += 1;
    } // end of while
    writer.on('data', chunk => {
      // console.log(`Received ${chunk.length} bytes of data.`);
    });

    await this.sleep(300);
    return true;
  }

  // TODO: add params for custom name file
  static prepareCsvFile(fn, headers): any {
    const appRoot = require('app-root-path');
    const uuidv1 = require('uuid/v1');
    const fileName = fn + '.csv';
    const tempFileName = moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const basePath = path.join(appRoot.path, 'dist/public/temps');
    const filePath = basePath + '/' + tempFileName;
    const urlPath = 'public/temps/' + tempFileName;

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
      tempFileName,
      filePath,
      urlPath,
      config: csvConfig,
    };
  }

  private static async emailSetting(url) {
    const result = new UpdateTaxResponseVM();
    try{
      let yesterday = moment().subtract(1, 'days').format('LL');
      const message = {
          from: 'dailyemail@sicepat.com',
          to: ConfigService.get('queue.exportHandoverSigesitMeta.emailTo'),
          cc: ConfigService.get('queue.exportHandoverSigesitMeta.emailCC'),
          subject: `List Handover Sigesit [${yesterday}]`,
          html: `<p>Dear All,</p>
          <p><a href="${url}">Here</a> is a link to download CSV of List Handover Sigesit [${yesterday}].</p>
          <p>This email is sent from an account we use for sending messages only. Don’t reply to this email.</p>`,
      };

      const emailStatus = await SendgridService.sendMail(message);
      result.statusCode = HttpStatus.OK;
      result.message = 'List Handover Sigesit successfully sent to email';      
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      const currDateTime = moment().toDate();
      console.log('########## STOP CRON FOR EXPORT HANDOVER SIGESIT :: timeNow ==============  ', currDateTime);
      return result;
    }
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

  static sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  static strReplaceFunc = str => {
    return str ? str.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/;/g, '|').replace(/,/g, '.') : null;
  }
}
