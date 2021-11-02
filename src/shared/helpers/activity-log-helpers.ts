import { ConfigService } from '../services/config.service';
import axios from 'axios';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export abstract class ActivityLogHelper {
  public static async logActivity(payload: any) {
    const path = '/api/v1/log';

    const options = {
      headers: {
        'Content-type': 'application/json',
      },
    };
    try {
      const response = await axios.post(
        ConfigService.get('activityLog.baseUrl') + path,
        payload,
        options,
      );
      return response.data;

    } catch (error) {
      if (error.response) {
        throw new BadRequestException(error.response.data);
      }
    }
  }
}
