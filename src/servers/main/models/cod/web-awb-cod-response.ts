import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class WebItemAwbCodResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  isCode: boolean;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty({ format: 'date-time' })
  manifestedDate: string;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  branchIdLast: string;

  @ApiModelProperty()
  branchNameLast: string;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  awbStatusIdLast: string;

  @ApiModelProperty()
  awbStatusLast: string;

  @ApiModelPropertyOptional()
  driverName: string;

}

export class WebAwbCodListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodResponseVm] })
  data: WebItemAwbCodResponseVm[];
}
