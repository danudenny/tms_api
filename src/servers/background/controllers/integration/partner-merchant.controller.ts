import { Body, Controller, Get } from '@nestjs/common';
import { PartnerMerchantService } from '../../services/integration/partner-merchant.service';

@Controller('integration/partner-merchant')
export class PartnerMerchantController {
  constructor() {}

  @Get('sync')
  public async sync(@Body() payload: any) {
    return PartnerMerchantService.sync(payload);
  }

}
