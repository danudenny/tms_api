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

  @ApiModelPropertyOptional()
  penaltyNote: string;

  @ApiModelProperty()
  employeeRoleId: number;
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
  representativeName: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: string;

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

  @ApiModelProperty()
  penaltyNote: string;

  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  employeeRoleCode: string;

  @ApiModelProperty()
  employeeRoleName: string;

}
export class EmployeePenaltyListResponseVM extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [EmployeePenaltyResponseVm] })
  data: EmployeePenaltyResponseVm[];
}
export class PenaltyCategoryVm {
  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyCategoryProcess: string;

  @ApiModelProperty()
  penaltyCategoryId: string;
}
export class PenaltyCategoryListResponseVm extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [PenaltyCategoryVm] })
  data: PenaltyCategoryVm[];
}
export class PenaltyEmployeeRoleNameVm{
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  employeeRoleCode: string;

  @ApiModelProperty()
  employeeRoleName: string;
}
export class PenaltyEmployeeRoleNameListResponseVm extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [PenaltyEmployeeRoleNameVm] })
  data: PenaltyEmployeeRoleNameVm[];
}
export class EmployeePenaltyVm {
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  employeeRoleCode: string;

  @ApiModelProperty()
  employeeRoleName: string;
}
export class EmployeePenaltyFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [EmployeePenaltyVm] })
  data: EmployeePenaltyVm[];
}