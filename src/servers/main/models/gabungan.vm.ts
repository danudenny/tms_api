import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';

export class GabunganPayloadVm {
  @ApiModelProperty()
  tujuan: string;

  @ApiModelProperty()
  employeName: string;

  @ApiModelProperty()
  bagDateReal: Date;

  @ApiModelProperty()
  description:string;

  @ApiModelProperty()
  awbs:[];

}
export class GabunganSearchVm {
  @ApiModelProperty()
  bagNumber: string;

}

