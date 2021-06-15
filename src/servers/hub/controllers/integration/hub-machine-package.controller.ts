import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiImplicitHeader,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { MachinePackageResponseVm } from '../../models/hub-gabungan.response.vm';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { HubMachineService } from '../../services/integration/hub-machine-package.services';
import { PackageMachinePayloadVm } from '../../models/hub-gabungan-mesin-payload.vm';
import * as hash from 'object-hash';
import { RedisService } from 'src/shared/services/redis.service';

@ApiUseTags('Hub Mesin Sortir Resi Bag')
@Controller('hub/sortir/combine')
export class HubMachinePackageController {
  constructor() { }

  @Post('packages')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: MachinePackageResponseVm })
  public async checkSpk(@Body() payload: PackageMachinePayloadVm) {
    const hashObj = {
      sorting_branch_id: payload.sorting_branch_id,
      reference_numbers: payload.reference_numbers,
      tag_seal_number: payload.tag_seal_number,
      chute_number: payload.chute_number,
    };

    const h = hash(hashObj);    
    const cacheKey = `cache:sorting-machine:push-payload:${h}`;
    const data = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    return await HubMachineService.processMachineBagging(payload, cacheKey);
  }
}
