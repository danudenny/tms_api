import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { MetaService } from '../../../../shared/services/meta.service';
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

    payload.searchFields = [
      {
        field: 'awbNumber',
      },
    ];
    payload.setFieldResolverMapAsSnakeCase(['awbNumber']);

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['awb_trouble_id', 'awbTroubleId'],
      ['awb_number', 'awbNumber'],
      ['status_resolve_id', 'statusResolveId'],
      ['created_time', 'scanInDateTime'],
    );

    const total = await q.count();

    payload.applyPaginationToOrionRepositoryQuery(q);

    const response = new AwbTroubleResponseVm();
    response.data = await q.exec();
    response.paging = MetaService.set(payload.page, payload.limit, total);

    return response;
  }
}
