import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';


export class EmployeePenaltyPayloadVm {
  @ApiModelProperty({ format: 'date-time' })
  createTime: Date;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  penaltyUserId: number;

  @ApiModelProperty()
  penaltyCategoryid: string;
  
  @ApiModelProperty()
  qty: number;

  @ApiModelProperty()
  penaltyFee: number;

  @ApiModelProperty()
  totalPenalty: number;

  @ApiModelPropertyOptional()
  penaltyDesc: string;

  @ApiModelPropertyOptional()
  refAwbNumber: string;

  @ApiModelPropertyOptional()
  refSpkCode: string;

  @ApiModelPropertyOptional()
  employeePenaltyId: string;
}

export class EmployeePenaltyResponseVm {
  @ApiModelProperty({ format: 'date-time' })
  penaltyDateTime: string;

  @ApiModelProperty()
  employeePenaltyId: string;

  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyCategoryId: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  firstName: string;

  @ApiModelProperty()
  userName: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  refSpkCode: string;

  @ApiModelProperty()
  qty: number;

  @ApiModelProperty()
  penaltyFee: number;

  @ApiModelProperty()
  totalPenalty: number;

  @ApiModelProperty()
  desc: string;

}

export class EmployeePenaltyListResponseVM extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [EmployeePenaltyResponseVm] })
  data: EmployeePenaltyResponseVm[];
}