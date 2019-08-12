import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import express = require('express');

import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { AttachmentService } from '../../../../shared/services/attachment.service';

@ApiUseTags('Master Data')
@Controller('master/attachment')
export class AttachmentController {
  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({
    disable: true,
  })
  public async downloadAttachment(
    @Res() serverResponse: express.Response,
    @Param('id') attachmentId: number,
  ) {
    return AttachmentService.sendAttachmentToClient(
      serverResponse,
      attachmentId,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({
    disable: true,
  })
  public async getAttachment(
    @Param('id') attachmentId: number,
  ) {
    return AttachmentService.findById(attachmentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({
    disable: true,
  })
  @ApiOkResponse({ type: Boolean })
  public async deleteAttachment(@Param('id') attachmentId: number) {
    await AttachmentService.deleteAttachment(attachmentId);

    return true;
  }
}
