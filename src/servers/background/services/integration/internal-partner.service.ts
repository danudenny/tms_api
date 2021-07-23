import { HttpStatus, Injectable, Param } from '@nestjs/common';
import moment = require('moment');
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { Partner } from '../../../../shared/orm-entity/partner';
import { PartnerSummary } from '../../../../shared/orm-entity/partner-summary';
import { GlobalVar } from '../../../../shared/orm-entity/global-var';

@Injectable()
export class InternalPartnerService {

  static async updateSummary(payload: any): Promise<any> {
    let result = {};
    let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59');
    let isExist = false;
    const partnerName = [];
    
    const partnerSummaryId = await GlobalVar.findOne({
      select: ['value'],
      where: {
        key: 'PARTNER_ID_SUMMARY',
        isDeleted: false,
      }
    });

    if (!partnerSummaryId || partnerSummaryId['value'].length == 0) {
      result = {
        code: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'No Data Partner Summary',
      };
      return result;
    } else{
      const partnerSummariesId = partnerSummaryId['value'];
      
      const query = `SELECT partner_id, partner_name, created_time FROM partner WHERE partner_id IN (${partnerSummariesId}) AND is_deleted = FALSE`;

    const results = await RawQueryService.query(query);

      for (const item of results) {
        const partnerId = item.partner_id;
        const createdTime = moment(item.created_time).format('YYYY-MM-DD 00:00:00');
        partnerName.push(item.partner_name);

        let whereStartDate = null;
        let totalOrder = 0;
        const partnerSummaries = await PartnerSummary.findOne({
          select: ['endDate', 'totalOrder'],
          where: {
            partnerId: partnerId,
            isDeleted: false,
          }
        });

        if (!partnerSummaries) {
          whereStartDate = createdTime;
        } else{
          whereStartDate = moment(partnerSummaries['endDate']).format('YYYY-MM-DD 00:00:00');
          totalOrder = partnerSummaries['totalOrder'];
          isExist = true;
        }
        
        const query = `SELECT COUNT(pr.pickup_request_id)
          FROM pickup_request pr
          INNER JOIN partner p ON pr.partner_id = p.partner_id AND p.is_deleted = FALSE
          WHERE pr.partner_id = ${partnerId} AND pr.created_time >= '${whereStartDate}' AND pr.created_time <= '${yesterday}' AND pr.is_deleted = FALSE`;

        const rawData = await RawQueryService.query(query);
        const newTotalOrder = rawData.length ? rawData[0]['count'] : 0;
        totalOrder = totalOrder + newTotalOrder;
        const timestamp = moment().toDate();
        
        let dataPartnerSummary = {
          partnerId: partnerId,
          endDate: yesterday,
          totalOrder: totalOrder,
          userIdUpdated: 1,
          updatedTime: timestamp,
        };

        if (!isExist) {
          dataPartnerSummary["startDate"] = createdTime;
          dataPartnerSummary["userIdCreated"] = 1;
          dataPartnerSummary["createdTime"] = timestamp;
          PartnerSummary.create(dataPartnerSummary);
          await PartnerSummary.insert(dataPartnerSummary);
        } else{
          await PartnerSummary.update(
            { partnerId, isDeleted: false },
            dataPartnerSummary,
          );
        }
      }
    }
    
    result = {
      code: HttpStatus.OK,
      message: 'Partner Summary of '+ partnerName.join(', ') +' successfully updated.',
    };
    return result;
  }
}
