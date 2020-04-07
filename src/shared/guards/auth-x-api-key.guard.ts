import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Partner } from '../orm-entity/partner';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';
import { ObjectService } from '../services/object.service';
import { RedisService } from '../services/redis.service';

@Injectable()
export class AuthXAPIKeyGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const partnerToken = RequestContextMetadataService.getMetadata(
      'PARTNER_TOKEN',
    );
    if (partnerToken) {
      // get data on redis;
      const dataRedis = await RedisService.get(
        `cache:partnerToken:${partnerToken}`,
        true,
      );

      if (dataRedis) {
        console.log(
          'Get data from redis key ',
          `cache:partnerToken:${partnerToken}`,
        );
        RequestContextMetadataService.setMetadata(
          'PARTNER_TOKEN_PAYLOAD',
          dataRedis,
        );
        return true;
      } else {
        const expireOnSeconds = 60 * 5; // 5 minute set on redis
        const partner = await Partner.findOne({
          where: { api_key: partnerToken },
        });
        if (partner) {
          const partnerPayload = ObjectService.transformToCamelCaseKeys(partner);
          // set data on redis
          await RedisService.setex(
            `cache:partnerToken:${partnerToken}`,
            JSON.stringify(partnerPayload),
            expireOnSeconds,
          );
          RequestContextMetadataService.setMetadata(
            'PARTNER_TOKEN_PAYLOAD',
            partnerPayload,
          );
          return true;
        } else {
          throw new BadRequestException('API KEY not found');
        }
      }
    } else {
      throw new ForbiddenException('API KEY is required');
    }
  }
}
