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

    // pid by pickup_request_id start 41102333
    // pid by work_order_id start 146744249 (30 Juni 2020)
    let pid = 146744249;
    const configId = 4;

    const schedulerConfig = await SchedulerConfig.findOne({
      schedulerConfigId: configId,
    });

    if (schedulerConfig) {
      pid = schedulerConfig.workOrderHistoryIdLast;
    }

    let isReprocess = false;
    if (payload.isReprocess == true){
      isReprocess = true;
    }

    const data = await this.getPickupRequest(pid, isReprocess);

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

        const crypto = require('crypto');
        partnerMerchant.encryptAddress = crypto.createHash('md5').update(p.pickup_request_address).digest('hex');

        partnerMerchant.merchantPhone = p.pickup_request_contact_no;
        partnerMerchant.pickupTime = '08:00';
        partnerMerchant.pickupType = 'TIME WINDOW';
        partnerMerchant.branchId = p.branch_id_assigned;

        partnerMerchant.userIdCreated = 0;
        partnerMerchant.userIdUpdated = 0;
        partnerMerchant.createdTime = timeNow;
        partnerMerchant.updatedTime = timeNow;

        await PartnerMerchant.insert(partnerMerchant);
      }

      PinoLoggerService.debug('##### PREV PID : ' + pid  + ' =======================================================');

      if (maxPid > -1 && !isReprocess) {
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

  private static async getPickupRequest(pid: number, isReprocess: boolean = false): Promise<any> {
    const select = 'pr.merchant_code, pr.pickup_request_name, pr.pickup_request_address, pr.pickup_request_email, pr.pickup_request_contact_no, pr.partner_id, branch_id_assigned';
    const select_encrypt = `
      MD5(CONCAT(
        pr.merchant_code, pr.pickup_request_name, MD5(pr.pickup_request_address), pr.pickup_request_email, pr.pickup_request_contact_no, pr.partner_id, branch_id_assigned
      ))
    `;
    let endpid = pid + 5000;
    let where = `
      and w.work_order_id > :pid
      and w.work_order_id <= :endpid
    `;
    let startDate = moment().format('YYYY-MM-DD 00:00:00');
    let endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    if (isReprocess){
      where = `
        and w.is_reprocess_partner_merchant = true
        and w.pickup_schedule_date_time >= :startDate
        and w.pickup_schedule_date_time < :endDate
      `;
    }

    const query = `
      SELECT
        MAX(pr.work_order_id) as max_pid, ` + select + `,
        ` + select_encrypt + ` as partner_merchant_code
      FROM (
        SELECT w.work_order_id, ` + select + `
        FROM work_order w
        INNER JOIN pickup_request_detail prd on w.work_order_id = prd.work_order_id_last and prd.is_deleted=false
        INNER JOIN pickup_request pr on
          pr.pickup_request_id = prd.pickup_request_id
          and pr.pickup_request_name <> ''
          and pr.pickup_request_address <> ''
          and pr.is_deleted = false
        LEFT JOIN partner_merchant pm on
          pm.merchant_name = pr.pickup_request_name
          and pm.encrypt_address = pr.encrypt_address255
          and pm.partner_id = pr.partner_id
          and pm.branch_id = w.branch_id_assigned
          and pm.is_deleted=false
        WHERE
          pm.partner_merchant_id is null
          ` + where + `
          and w.branch_id_assigned is not null
          and w.is_deleted = false
      ) pr
      GROUP BY ` + select + `
    `;

    return await RawQueryService.queryWithParams(query, {
      pid,
      endpid,
      startDate,
      endDate,
    });
  }
}
