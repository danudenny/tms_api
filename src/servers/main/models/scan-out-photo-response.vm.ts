import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class ScanOutPhotoVm  {
  @ApiModelProperty()
  photoId: string;

  }
