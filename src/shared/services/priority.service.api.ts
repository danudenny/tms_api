import axios from 'axios';
import {ConfigService} from '../../shared/services/config.service';
import { RequestErrorService } from '../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';

export class PriorityServiceApi {
  public static get queryServiceUrl() {
    return ConfigService.get('priorityService.baseUrl');
  }

  public static async checkPriority(awbNumber, branchId) {
    try{
      //TODO: Implement service priority here
      // const request = await axios.post(url, body, options);
      const request = null;
      request.data = 'A1';
      return request.data;
    }catch(err){
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service priority',
          error : err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}