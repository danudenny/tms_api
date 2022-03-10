import { IsDefined } from 'class-validator';
import { IsBagNumber } from '../../../../../shared/decorators/custom-validation.decorator';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../../shared/external/nestjs-swagger';

export class SortationScanOutVehiclePayloadVm {
  @ApiModelProperty()
  employeeDriverId: number;

  @ApiModelProperty()
  doSortationDate: Date;

  @ApiModelProperty()
  vehicleId: string;

  @ApiModelProperty()
  sortationTrip: number;

  @ApiModelPropertyOptional()
  desc: string;
}

export class SortationScanOutRoutePayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  branchCode: string;
}

export class SortationScanOutBagsPayloadVm {
  @ApiModelProperty({
    example: 'asdnkasndkasd',
    skipValidation: true,
  })
  @IsDefined({message: 'Sortation ID harus diisi'})
  doSortationDetailId: string;

  @IsDefined({message: 'No gabung paket/sortir harus diisi'})
  @IsBagNumber({ message: 'No gabung paket/sortir tidak sesuai' })
  @ApiModelProperty()
  bagNumbers: string[];
}

export class SortationScanOutLoadPayloadVm {
  @ApiModelProperty()
  doSortationId: string;
}

export class SortationScanOutDonePayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  employeeIdDriver: number;
}
