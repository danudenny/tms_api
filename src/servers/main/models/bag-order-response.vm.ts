import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class BagAwbVm  {
  @ApiModelProperty()
  @IsDefined({message: 'Bag Number harus diisi'})
  bagNumber: string;

  }
export class BagDetailVm  {
  @ApiModelProperty()
  doPodId: string;

  }

export class PhotoDetailVm  {
    @ApiModelProperty()
    doPodDeliverId: string;

    }
