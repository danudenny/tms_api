import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbTroublePayloadVm } from '../../models/awb-trouble-payload.vm';
import { AwbTroubleResponseVm } from '../../models/awb-trouble-response.vm';

@ApiUseTags('Web Awb Trouble')
@Controller('web/pod')
export class WebAwbTroubleControlelr {
  @Post('troubledList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbTroubleResponseVm })
  public async troubledList(@Body() payload: AwbTroublePayloadVm) {
    const repository = new OrionRepositoryService(AwbTrouble);
    const q = repository.findAllRaw();

    q.selectRaw(
      ['[0]', 'awbTroubleId'],
      ['[1]', 'awbNumber'],
      ['[2]', 'statusResolveId'],
      ['[3]', 'scanInDateTime'],
      awbTrouble => [
        awbTrouble.awbTroubleId,
        awbTrouble.awbNumber,
        awbTrouble.statusResolveId,
        awbTrouble.createdTime,
      ],
    );
    q.take(payload.take);
    q.skip(payload.skip);

    const response = new AwbTroubleResponseVm();
    response.data = await q.exec();

    return response;
  }
}
