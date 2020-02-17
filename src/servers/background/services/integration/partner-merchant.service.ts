import { Injectable } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PartnerMerchant } from '../../../../shared/orm-entity/partner-merchant';
import { SchedulerConfig } from '../../../../shared/orm-entity/scheduler-config';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';

import moment = require('moment');

@Injectable()
export class PartnerMerchantService {
  static async sync(payload: any): Promise<any> {
    const result = [];

    let pid = 41102333;
    const configId = 4;

    const schedulerConfig = await SchedulerConfig.findOne({
      schedulerConfigId: configId,
    });

    if (schedulerConfig) {
      pid = schedulerConfig.workOrderHistoryIdLast;
    }

    const data = await this.getPickupRequest(pid);

    if (data) {
      let maxPid = -1;
      for (const p of data) {
        result.push(p.partner_merchant_code);

        if (p.max_pid > maxPid) {
          maxPid = p.max_pid;
        }

        const timeNow = moment().toDate();
        const partnerMerchant = PartnerMerchant.create();
        partnerMerchant.partnerId = p.partner_id;
        partnerMerchant.partnerMerchantCode = p.partner_merchant_code;
        partnerMerchant.merchantName = p.pickup_request_name;
        partnerMerchant.merchantEmail = p.pickup_request_email;
        partnerMerchant.merchantCode = p.merchant_code;
        partnerMerchant.merchantAddress = p.pickup_request_address;
        partnerMerchant.merchantPhone = p.pickup_request_contact_no;
        partnerMerchant.pickupTime = '08:00';
        partnerMerchant.pickupType = 'TIME WINDOW';

        partnerMerchant.userIdCreated = 0;
        partnerMerchant.userIdUpdated = 0;
        partnerMerchant.createdTime = timeNow;
        partnerMerchant.updatedTime = timeNow;
        await PartnerMerchant.insert(partnerMerchant);
      }

      PinoLoggerService.debug('##### PREV PID : ' + pid  + ' =======================================================');

      if (maxPid > -1) {
        PinoLoggerService.debug('##### MAX PID : ' + maxPid  + ' =======================================================');

        const timeNow = moment().toDate();
        await SchedulerConfig.update(configId, {
          workOrderHistoryIdLast: maxPid,
          updatedTime: timeNow,
        });
      }
    }

    return result;
  }

  private static async getPickupRequest(pid: number): Promise<any> {
    const select = 'pr.merchant_code, pr.pickup_request_name, pr.pickup_request_address, pr.pickup_request_email, pr.pickup_request_contact_no, pr.partner_id';

    const query = `
      SELECT
        MAX(pr.pickup_request_id) as max_pid, ` + select + ` ,
        MD5(CONCAT(` + select + `)) as partner_merchant_code
      FROM (
        SELECT pr.pickup_request_id, ` + select + `
        FROM pickup_request pr
        LEFT JOIN partner_merchant pm on pm.partner_merchant_code= MD5(CONCAT(pr.merchant_code, pr.pickup_request_name, pr.pickup_request_address, pr.pickup_request_email, pr.pickup_request_contact_no, pr.partner_id))  and pm.is_deleted=false
        LEFT JOIN pickup_request_detail prd on pr.pickup_request_id=prd.pickup_request_id and prd.is_deleted=false
        WHERE pm.partner_merchant_id is null and pr.pickup_request_id > :pid and pr.pickup_request_name<>'' and pr.pickup_request_address<>'' and pr.is_deleted=false
        LIMIT 2500
      ) pr
      GROUP BY ` + select + `
    `;

    return await RawQueryService.queryWithParams(query, {
      pid,
    });
  }
}
