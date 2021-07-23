import { Controller, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { InternalPartnerService } from '../../services/integration/internal-partner.service';
import { ApiUseTags, ApiImplicitHeader } from '../../../../shared/external/nestjs-swagger';

@ApiUseTags('Partner Integration Internal')
@Controller('integration/internal-partner')
export class InternalPartnerController {
  constructor() {}

  @Get('update-summary')
  @HttpCode(HttpStatus.OK)
  // @ApiImplicitHeader({ name: 'x-api-key' })
  // @UseGuards(AuthXAPIKeyGuard)
  public async updateSummary(@Req() req: any) {
    return InternalPartnerService.updateSummary(req.payload);
  }
}