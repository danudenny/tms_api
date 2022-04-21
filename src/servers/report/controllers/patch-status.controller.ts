import { HttpCode, Controller, Get, HttpStatus, UseGuards, Param } from '@nestjs/common';
import { ApiUseTags, ApiImplicitHeader, ApiOkResponse } from '../../../shared/external/nestjs-swagger';
import { AuthKeyCodGuard } from '../../../shared/guards/auth-key-cod.guard';
import { RedisService } from '../../../shared/services/redis.service';

@ApiUseTags('Patcher')
@Controller('patcher')
export class PatchStatusController {
  constructor() {}
  @Get('unblock-user/:username')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  public async patchUnblockUser(@Param('username') username: string) {
    await RedisService.del(`pod:login-block:${username}`); 

    return {
      status: "success",
    };
  }
}
