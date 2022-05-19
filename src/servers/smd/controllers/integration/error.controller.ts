import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Error Test SMD')
@Controller('smd')
export class ErrorSMDController {
  constructor() {}

  @Post('error')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async ErrorTesting() {
    throw new Error('Test Message Error');
  }
}
