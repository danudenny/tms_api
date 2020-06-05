import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileSmdListDetailPayloadVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

}

export class MobileSmdDeparturePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  longitude: string;

}

export class MobileSmdArrivalPayloadVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  longitude: string;

}

export class MobileUploadImagePayloadVm {
  // do_smd_detail_id
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  image_type: string;

}

export class MobileSmdProblemPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  reason_id: number;

  @ApiModelProperty()
  reason_note: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  longitude: string;

}
