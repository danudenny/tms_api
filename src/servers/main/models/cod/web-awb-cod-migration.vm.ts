import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

// migration transaction
export class WebCodMigrationAwbPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  codValue: number;

}

export class WebCodMigrationTransferPayloadVm {
  @ApiModelProperty()
  nikDriver: string;

  @ApiModelProperty({ type: () => [WebCodMigrationAwbPayloadVm] })
  data: [WebCodMigrationAwbPayloadVm];

}

export class WebCodMigrationTransferBranchResponseVm {
  @ApiModelProperty()
  transactionId: string;

  @ApiModelProperty()
  dataError: string[];
}
