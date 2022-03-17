import { ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { PackagePayloadVm } from './gabungan-payload.vm';

export class RejectPackagePayloadVm extends PackagePayloadVm {
  @ApiModelPropertyOptional({
    example: 'Reject',
  })
  note?: 'Irregular' | 'Reject';
}
