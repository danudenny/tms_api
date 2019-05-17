import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobileDashboardhistVm } from './MobileDashboard.vm';
import { MobileDashboardSpecialInstructionVm } from '../models/MobileDashboardSpecialInstruction.vm';


export class MobileDeliveryVm {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  merchant: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  packageType: string;

  @ApiModelProperty()
  packageTypeName: string;

  @ApiModelProperty()
  productType: string;

  @ApiModelProperty()
  isCOD: boolean;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty({ type: () => MobileDashboardhistVm, isArray: true })
  redeliveryHistory: MobileDashboardhistVm[];

  @ApiModelProperty({ type: () => MobileDashboardSpecialInstructionVm, isArray: true })
  specialInstruction: MobileDashboardSpecialInstructionVm[];
}
