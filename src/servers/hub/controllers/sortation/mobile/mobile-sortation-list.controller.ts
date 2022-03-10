import { Controller } from '@nestjs/common';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';

@ApiUseTags('Mobile Sortation List')
@Controller('mobile/sortation')
export class MobileSortationListController {
  constructor() {}

}
