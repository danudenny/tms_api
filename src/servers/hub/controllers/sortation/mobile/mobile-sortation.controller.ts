import { Controller } from '@nestjs/common';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';

@ApiUseTags('Mobile Sortation')
@Controller('mobile')
export class MobileSortationController {
  constructor() {}

}
