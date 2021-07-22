import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class BagAwbExportVm extends BaseMetaPayloadVm{
  @ApiModelPropertyOptional()
  // @IsDefined({ message: 'Bag Number harus diisi' })
  bagNumber: string;
}

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
