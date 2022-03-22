import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class SortationL2ModuleSearchPayloadVm {
  @ApiModelProperty()
  nik: string;
}

export class SortationL2ModuleFinishManualPayloadVm {
  @ApiModelProperty()
  doSortationCode: string;
}
