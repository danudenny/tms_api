import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RepresentativePayloadSearchVm {
  @ApiModelProperty()
  search: string;
}

export class RepresentativePayloadVm {
  @ApiModelProperty({ type: () => RepresentativePayloadSearchVm })
  filters: RepresentativePayloadSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}
