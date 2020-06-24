import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class MonitoringResponseVm extends BaseMetaResponseVm {

    @ApiModelProperty({ type: () => [MonitoringListVm] })
    data: MonitoringListVm[];
    // @ApiModelProperty({ type: () => [ScanInListVm] })
    // data: ScanInListVm[];
  }

export class MonitoringListVm {
    // @ApiModelProperty()
    // bag_id: number;

    // @ApiModelProperty()
    // bag_item_id: number;

    // @ApiModelProperty()
    // bag_number_seq: string;

    // @ApiModelProperty()
    // branch_name: string;

    // @ApiModelProperty()
    // bagging_datetime: string;

    @ApiModelProperty()
    doSmdDateTime: string;

    @ApiModelProperty()
    doSmdCode: string;

    @ApiModelProperty()
    doSmdBranchNameList: string;

    @ApiModelProperty()
    branchFromName: string;

    @ApiModelProperty()
    trip: number;

    @ApiModelProperty()
    vehicleCapacity: number;

    // @ApiModelProperty()
    // tot_resi: number;

    // @ApiModelProperty()
    // weight: number;

    // @ApiModelProperty()
    // weight_accumulative: number;

    // @ApiModelProperty()
    // fullname: string;
  }
