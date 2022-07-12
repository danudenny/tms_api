import axios from 'axios';
import { ConfigService } from '../../shared/services/config.service';
import { RequestErrorService } from '../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import { SlackUtil } from '../util/slack';

export class PriorityServiceApi {
  public static get queryServiceUrl() {
    return ConfigService.get('priorityService.baseUrl');
  }

  public static get xApiKey() {
    return ConfigService.get('priorityService.xApiKey');
  }

  public static async checkPriority(awbNumber, branchId) {
    let url = `${this.queryServiceUrl}branch-zone-priority`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key' : this.xApiKey
      }
    };

    const body = {
      awb_number: awbNumber,
      branch_id: branchId
    };

    try {
      //TODO: Implement service priority here
      let data = await this.funcGetData(url, body, options);
      return data;
    } catch (err) {
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service priority',
          error: err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private static async funcGetData(url, body, options, countRetry = 0){
    let channelSlack = await ConfigService.get('priorityService.slackChannel');
    countRetry = countRetry + 1;
    try{
      const request = await axios.post(url, body, options);
      return request;
    }catch(err){
      if(countRetry >= ConfigService.get('priorityService.retryCount')){
        await SlackUtil.sendMessage(channelSlack,"Error from hit service for check priority attempt "+countRetry,err.stack, body);
        return{
          data :{
            kelurahan : "",
            zone : "",
            priority : ""
          }
        }
      } 
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      await delay(ConfigService.get('priorityService.delayTime'));
      if(countRetry < ConfigService.get('priorityService.retryCount')){
        return this.funcGetData(url, body, options, countRetry);
      }
    }
  }
}