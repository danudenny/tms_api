import { BadRequestException } from '@nestjs/common';
import { RedisService } from './redis.service';

export class ResponseMaintenanceService {

  public static async dropService(): Promise<boolean> {
    // NOTE: first set data on redis shared
    // type data object {isActive: boolean, message: string}
    // sample script on redis:
    // set serviceNotification:partnerDropService "{\"isActive\":true,\"message\":\"Permintaan Drop sementara tidak dapat di layani pada tanggal 20-25 Mei 2020\"}"
    interface IServiceNotification {
      isActive: boolean;
      message: string;
    }
    // read data flag on redis
    const data: IServiceNotification = await RedisService.get(
      `serviceNotification:partnerDropService`,
      true,
    );
    if (data && data.isActive) {
      throw new BadRequestException(data.message);
    } else {
      return true;
    }
  }
}
