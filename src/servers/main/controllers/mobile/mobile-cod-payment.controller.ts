import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Body,
  Get,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { V1MobileDivaPaymentService } from '../../services/mobile/v1/mobile-diva-payment.service';
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';

// TODO: disabled v1 soon
@ApiUseTags('Cod Diva Payment')
@Controller('mobile/cod-payment')
@ApiBearerAuth()
export class CodPaymentController {
  constructor() {}

  @Get('diva/pingQR')
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentPingQR() {
    throw new BadRequestException(
      'Permintaan Payment Cashless sementara tidak dapat di layani',
    );
  }

  @Post('diva/getQR')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentGetQR(@Body() payload: any) {
    throw new BadRequestException(
      'Permintaan Payment Cashless sementara tidak dapat di layani',
    );
  }

  @Post('diva/sendQR')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentSendQR(@Body() payload: any) {
    // NOTE: handle for message disable this service
    throw new BadRequestException(
      'Permintaan Payment Cashless sementara tidak dapat di layani',
    );
  }

  // TODO: disabled soon
  @Post('diva/paymentStatus')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentStatus(@Body() payload: any) {
    throw new BadRequestException(
      'Permintaan Payment Cashless sementara tidak dapat di layani',
    );
  }

  @Post('diva/paymentStatusV2')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentStatusManual(@Body() payload: any) {
    // NOTE: handle for message disable this service
    throw new BadRequestException(
      'Permintaan Payment Cashless sementara tidak dapat di layani',
    );
  }
}
