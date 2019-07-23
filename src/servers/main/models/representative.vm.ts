import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RepresentativeVm {
  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  representativeName: string;
}
