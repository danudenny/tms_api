import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../../shared/models/base-meta-response.vm';

export class SortationFinishHistoryResponVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanSortationFinshResponVm]})
  data: ScanSortationFinshResponVm[];
}

export class ScanSortationFinshResponVm {

  @ApiModelProperty()
  sortationFinishHistoryId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  driverId: number;

  @ApiModelProperty()
  createdTime: Date;

  @ApiModelProperty()
  updatedTime: Date;

  @ApiModelProperty()
  userIdCreated: number;

  @ApiModelProperty()
  userIdUpdated: number;

  @ApiModelProperty()
  employeeIdDriver: number;

  @ApiModelProperty()
  adminName: string;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  driverNik: number;

  @ApiModelProperty()
  adminNik: number;

}
