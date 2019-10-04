import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class WebScanPhotoResponseVm {
  @ApiModelProperty()
  url: string;
}
