import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class BagAwbVm {
  @ApiModelProperty()
  @IsDefined({ message: 'Bag Number harus diisi' })
  bagNumber: string;

  @ApiModelPropertyOptional()
  DoPodDeliverDetail?: string;
}
export class BagDetailVm {
  @ApiModelPropertyOptional()
  doPodId?: string;
}

export class BagDeliveryDetailVm {
  @ApiModelProperty()
  doPodDeliveryId: string;
}

export class PhotoDetailVm {
  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelPropertyOptional({ example: 'photo, photoCod, signature'})
  attachmentType: string;
}
