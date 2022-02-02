import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ScaninDataDetailScanResponseVm } from './scanin-smd.response.vm';

class DoMutationVm {
  @ApiModelProperty()
  do_mutation_id: string;

  @ApiModelProperty()
  do_mutation_code: string;

  @ApiModelProperty()
  do_mutation_date: string;
}
export class DoMutationResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: DoMutationVm | null;
}

class InsertDoMutationDetailVm {
  @ApiModelProperty()
  is_success: string;

  @ApiModelProperty()
  bag_item_id: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  do_mutation_detail_id: string;
}

export class InsertDoMutationDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: InsertDoMutationDetailVm;
}

export class DeleteDoMutationResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;
}

export class DoMutationBagStatusResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;
}

class DoMutationListVm {
  @ApiModelProperty()
  do_mutation_id: string;

  @ApiModelProperty()
  do_mutation_code: string;

  @ApiModelProperty()
  do_mutation_date: string;

  @ApiModelProperty()
  do_mutation_note: string;

  @ApiModelProperty()
  branch_from: string;

  @ApiModelProperty()
  branch_to: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_weight: number;
}

export class GetDoMutationResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoMutationListVm] })
  data: DoMutationListVm[];
}

export class DoMutationDetailVm {
  @ApiModelProperty()
  bag_number: string;
}

export class GetDoMutationDetailResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoMutationDetailVm] })
  data: DoMutationDetailVm[];
}

export class DoMutationDataDetailResponseVm {
  // @ApiModelProperty()
  // do_mutation_id: string;
  //
  // @ApiModelProperty()
  // do_mutation_code: string;
  //
  // @ApiModelProperty()
  // do_mutation_date: string;

  @ApiModelProperty()
  bagWeight: string;

  @ApiModelProperty()
  bagNumber: string;
}

export class PrintDetailDoMutationResponseVm {
  @ApiModelProperty({ type: () => [DoMutationDataDetailResponseVm] })
  data: DoMutationDataDetailResponseVm[];
}
