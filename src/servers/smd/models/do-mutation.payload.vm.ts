import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';

export class DoMutationPayloadVm {
  @ApiModelProperty()
  do_mutation_date: Date;

  @ApiModelProperty()
  branch_id: number;

  @ApiModelProperty()
  note: string;
}

export class InsertDoMutationDetailPayloadVm {
  @ApiModelProperty()
  do_mutation_id: string;

  @ApiModelProperty()
  bag_number: string;
}

export class InsertDoMutationStatusPayloadVm {
  @ApiModelProperty()
  do_mutation_id: string;
}

export class DeleteDoMutationVm {}

export class DoMutationListFilterVm {
  @ApiModelProperty()
  start_date?: Date;

  @ApiModelProperty()
  end_date?: Date;

  @ApiModelProperty()
  branch_id_from?: number;

  @ApiModelProperty()
  branch_id_to?: number;
}

export class DoMutationListPayloadVm {
  @ApiModelPropertyOptional({ type: () => DoMutationListFilterVm })
  filters?: DoMutationListFilterVm;

  @ApiModelPropertyOptional()
  page?: number;

  @ApiModelPropertyOptional()
  limit?: number;

  @ApiModelPropertyOptional()
  sortBy?:
    | 'created_time'
    | 'do_mutation_date'
    | 'branch_id_from'
    | 'branch_id_to'
    | 'total_weight';

  @ApiModelPropertyOptional()
  sortDir?: 'ASC' | 'DESC';
}

export class DoMutationBagsFilterVm {
  @ApiModelProperty()
  do_mutation_id: string;
}

export class DoMutationBagsVm {
  @ApiModelProperty({ type: () => DoMutationBagsFilterVm })
  filters: DoMutationBagsFilterVm;

  @ApiModelPropertyOptional()
  page?: number;

  @ApiModelPropertyOptional()
  limit?: number;
}
