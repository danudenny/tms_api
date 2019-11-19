import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class MobileAtendanceListResponseAllVm {

  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  checkInDate: string;

  @ApiModelProperty()
  checkOutDate: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  branchNameCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

  @ApiModelProperty()
  urlCheckIn: string;

  @ApiModelProperty()
  urlCheckOut: string;

  @ApiModelProperty()
  branchNameCheckOut: string;

  @ApiModelProperty()
  branchAsalDriver: string;
}

export class MobileAtendanceListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MobileAtendanceListResponseAllVm] })
  data: MobileAtendanceListResponseAllVm[];
}
