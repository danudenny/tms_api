import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';
import { PrintDoPodBagDataVm } from '../print-do-pod-bag.vm';
import { PrintDoPodDeliverDataDoPodDeliverDetailVm, PrintDoPodDeliverDataUserDriverVm, PrintDoPodDeliverDataVm } from '../print-do-pod-deliver.vm';
import { PrintDoPodDataVm } from '../print-do-pod.vm';

export class PrintDoPodReturnDataVm {
  @ApiModelProperty()
  doPodDeliverId: number;

  @ApiModelProperty()
  doPodReturnCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverDataUserDriverVm })
  userDriver: PrintDoPodDeliverDataUserDriverVm = new PrintDoPodDeliverDataUserDriverVm();

  @ApiModelProperty({ type: () => [PrintDoPodDeliverDataDoPodDeliverDetailVm] })
  doPodReturnDetails: PrintDoPodDeliverDataDoPodDeliverDetailVm[] = [];
}

export class WebDoPodCreateReturnResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  doPodId: string;

  // @ApiModelProperty({ type: () => PrintDoPodDataVm })
  // printDoPodMetadata: PrintDoPodDataVm = new PrintDoPodDataVm();

  // @ApiModelProperty({ type: () => PrintDoPodBagDataVm })
  // printDoPodBagMetadata: PrintDoPodBagDataVm = new PrintDoPodBagDataVm();

  @ApiModelProperty({ type: () => PrintDoPodReturnDataVm })
  printDoPodReturnMetadata: PrintDoPodReturnDataVm = new PrintDoPodReturnDataVm();
}

export class ScanAwbReturnVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;

  @ApiModelPropertyOptional({
    type: () => PrintDoPodDeliverDataDoPodDeliverDetailVm,
  })
  printDoPodReturnMetadata?: PrintDoPodDeliverDataDoPodDeliverDetailVm = new PrintDoPodDeliverDataDoPodDeliverDetailVm();
}

export class WebScanAwbReturnResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbReturnVm] })
  data: ScanAwbReturnVm[];
}

export class WebScanInReturnGroupResponseVm {
  @ApiModelProperty({ format: 'date' })
  datePOD: string;

  @ApiModelProperty()
  totalSuratJalan: number;

  @ApiModelProperty()
  totalAssigned: number;

  @ApiModelProperty()
  totalOnProcess: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  branchName: number;

  @ApiModelProperty()
  nickname: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  userIdDriver: number;
}

export class WebScanOutReturnGroupListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({
    type: () => [WebScanInReturnGroupResponseVm],
  })
  data: WebScanInReturnGroupResponseVm[];
}
