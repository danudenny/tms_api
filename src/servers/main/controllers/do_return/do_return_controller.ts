import { Body, Controller, HttpCode, Post, UseGuards, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { DoReturnService } from '../../services/do-return/do-return.service';
import { ReturnPayloadVm, DoReturnResponseVm } from '../../models/do-return.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoReturnPayloadVm } from '../../models/do-return-update.vm';
import { ReturnFindAllResponseVm, DoReturnAdminFindAllResponseVm } from '../../models/do-return.response.vm';
import { ReturnUpdateFindAllResponseVm } from '../../models/do-return-update.response.vm';
import { DoReturnCreateVm, ReturnCreateVm } from '../../models/do-return-create.vm';
import { DoReturnDeliveryOrderCreateVm } from '../../models/do-return-surat-jalan-create.vm';
import { FileInterceptor } from '@nestjs/platform-express';
import { DoReturnDeliveryOrderCtCreateVm, DoReturnDeliveryOrderCustCreateVm } from '../../models/do-return-surat-jalan-ct-create.vm';

@ApiUseTags('Do Return')
@Controller('doReturn')
export class DoReturnController {
  @Post('listAwb')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnFindAllResponseVm })
  public async findAllByRequest(@Body() payload: BaseMetaPayloadVm ) {
    return DoReturnService.findAllByRequest(payload);
  }

  @Post('updateStatus')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnUpdateFindAllResponseVm })
  public async updateDoReturn(@Body() payload: DoReturnPayloadVm ) {
    return DoReturnService.updateDoReturn(payload);
  }

  @Post('dolist/admin')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: DoReturnAdminFindAllResponseVm })
  public async findAllDoListAdmin(@Body() payload: BaseMetaPayloadVm ) {
    return DoReturnService.findAllDoListAdmin(payload);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnUpdateFindAllResponseVm })
  public async returnCreate(@Body() payload: ReturnCreateVm) {
    return DoReturnService.returnCreate(payload);
  }

  @Post('deliveryOrder/create')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnUpdateFindAllResponseVm })
  public async deliveryOrderCreate(
    @Body() payload: DoReturnDeliveryOrderCreateVm,
    @UploadedFile() file,
  ) {
    return DoReturnService.deliveryOrderCreate(payload, file);
  }

  @Post('deliveryOrder/ct/create')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnUpdateFindAllResponseVm })
  public async deliveryOrderCtCreate(@Body() payload: DoReturnDeliveryOrderCtCreateVm) {
    return DoReturnService.deliveryOrderCtCreate(payload);
  }

  @Post('deliveryOrder/cust/create')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnUpdateFindAllResponseVm })
  public async deliveryOrderCustCreate(@Body() payload: DoReturnDeliveryOrderCustCreateVm) {
    return DoReturnService.deliveryOrderCustCreate(payload);

  }
}
