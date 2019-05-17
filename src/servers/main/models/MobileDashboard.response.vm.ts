import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobiledashboardVm } from './MobileDashboard.vm';

export class MobileDashboardFindAllResponseVm  {
  @ApiModelProperty({ type: () => [MobiledashboardVm] })
  data: MobiledashboardVm[];
}
