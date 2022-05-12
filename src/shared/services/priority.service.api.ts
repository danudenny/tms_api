import axios from 'axios';
import { ConfigService } from '../../shared/services/config.service';
import { RequestErrorService } from '../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';

export class PriorityServiceApi {
  public static get queryServiceUrl() {
    return ConfigService.get('priorityService.baseUrl');
  }

  public static async checkPriority(awbNumber, branchId) {
    let url = `${this.queryServiceUrl}test`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    const body = {
      awbNumber: awbNumber,
      branchId: branchId
    };

    try {
      //TODO: Implement service priority here
      // const request = await axios.post(url, body, options);
      let request = {
        data: {
          zone : 'A',
          priority : '1',
          kelurahan : 'Kebon Jeruk'
        }
      }
      return request;
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
}