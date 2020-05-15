import { Body, Controller, Post, Req } from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanInSmdPayloadVm } from '../../models/scanin-smd.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';

@ApiUseTags('SCAN IN POD')
@Controller('branch')
export class ScanInController {
  constructor() {}

  @Post('scanIn/bag')
  @Transactional()
  public async scanInBagSmd(
    @Req() request: any,
    @Body() payload: ScanInSmdPayloadVm,
  ) {
      return ScaninSmdService.scanInBag(payload);
    }

  @Post('scanIn/bagging')
  @Transactional()
  public async scanInBaggingSmd(
    @Req() request: any,
    @Body() payload: ScanInSmdPayloadVm,
  ) {
      return ScaninSmdService.scanInBagging(payload);
    }
}
