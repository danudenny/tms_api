import { ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileInitDataPayloadVm {
  @ApiModelPropertyOptional({ format: 'date-time' })
  lastSyncDateTime: string;
}
