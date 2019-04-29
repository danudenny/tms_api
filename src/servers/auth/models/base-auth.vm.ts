import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseTimestampVm } from '../../../shared/models/base-internal-timestamp.vm';
import { RoleVm } from './role.vm';

export class BaseAuthVm extends BaseTimestampVm {
  @ApiModelProperty()
  id: string;

  @ApiModelProperty({ type: () => [RoleVm] })
  roles: RoleVm[];

  @ApiModelProperty()
  tenantId: string;

  // @ApiModelProperty({ type: () => TenantVm })
  // tenant: TenantVm;

  // @ApiModelProperty({ type: () => [OutletVm] })
  // outlets: OutletVm[];

  @ApiModelProperty()
  outletIds: string[];
}
