import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class MobilePostKorwilTransactionPayloadVm {
  @ApiModelPropertyOptional()
  deletedPhotos: string;

  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  status: number;
}

export class MobileValidateCoordinateKorwilTransactionPayloadVm {
  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  branchId: string;
}

export class MobileKorwilListItemPayloadVm {
  @ApiModelProperty()
  branchId: string;
}

export class MobileUpdateProcessKorwilPayloadVm {
  @ApiModelProperty()
  korwilTransactionId: string;
}

export class KorwilHistoryPayloadVm extends BaseMetaPayloadVm {
  @ApiModelPropertyOptional({
    example: '2020-01-20',
    skipValidation: true,
  })
  checkInDateFrom: string;

  @ApiModelPropertyOptional({
    example: '2020-01-20',
    skipValidation: true,
  })
  checkInDateTo: string;

  @ApiModelPropertyOptional({
    example: '2020-01-20',
    skipValidation: true,
  })
  checkOutDateFrom: string;

  @ApiModelPropertyOptional({
    example: '2020-01-20',
    skipValidation: true,
  })
  checkOutDateTo: string;

  @ApiModelPropertyOptional({
    example: ['checkIn', 'checkOut'],
    skipValidation: true,
  })
  status: string;

  @ApiModelPropertyOptional()
  branchId: string;
}
