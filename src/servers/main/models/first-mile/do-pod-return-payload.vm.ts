
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { IsAwbNumber } from '../../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';
import { MobileReturnVm, PrintDoPodReturnDataVm } from './do-pod-return-response.vm';

export class WebDoPodCreateReturnPayloadVm {
  @ApiModelPropertyOptional({
    example: 123,
  })
  userIdDriver: number;

  @ApiModelPropertyOptional({
    example: '2019-05-01 00:00:00',
    format: 'date-time',
  })
  doPodDateTime: string;

  @ApiModelPropertyOptional({
    example: 'keterangan',
  })
  desc?: string;
}

export class WebScanAwbReturnPayloadVm  {
  @ApiModelProperty({
    example: 203,
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodReturnId: string;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })

  @IsDefined({message: 'Nomor resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class WebReturnVm {
  @ApiModelPropertyOptional()
  doPodReturnDetailId: string;

  @ApiModelPropertyOptional()
  doPodReturnId: string;

  @ApiModelPropertyOptional({ format: 'date-time' })
  doPodReturnDate: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelPropertyOptional()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  consigneeNameNote: string;

  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonNotes: string;

}

export class WebAwbReturnSyncPayloadVm {
  @ApiModelProperty({ type: () => [WebReturnVm] })
  returnList: WebReturnVm[];
}

export class PrintDoPodReturnVm {
  @ApiModelProperty({ type: () => PrintDoPodReturnDataVm })
  data: PrintDoPodReturnDataVm = new PrintDoPodReturnDataVm();
}

export class PrintDoPodReturnPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  printCopy: number;
}

export class MobileScanAwbReturnPayloadVm {
  @ApiModelProperty()
  @IsDefined({ message: 'Nomor awb harus diisi' })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string;

  @ApiModelProperty()
  @IsDefined({ message: 'Nomor surat jalan harus diisi' })
  doPodReturnId: string;
}

export class MobileInitDataPayloadVm {
  @ApiModelPropertyOptional({ format: 'date-time' })
  lastSyncDateTime: string;

  @ApiModelPropertyOptional()
  @Type(() => String)
  awbNumber: string;
}

export class MobileSyncReturnPayloadVm {
  @ApiModelProperty({ type: () => [MobileReturnVm] })
  returnsData: MobileReturnVm[];

  @ApiModelProperty({ format: 'date-time' })
  lastSyncDateTime: string;
}

export class MobileSyncReturnImageDataPayloadVm {
  @ApiModelProperty()
  data: string;

  @ApiModelProperty()
  imageType: string;
}

export class MobileHistoryDataReturnPayloadVm {
  @ApiModelProperty({
    type: 'string',
    format: 'date-time',
    example: '2021-05-06T17:00:00.000Z',
  })
  dateFrom: string;

  @ApiModelPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2021-05-06T17:00:00.000Z',
  })
  dateTo: string;
}
export class MobileHistoryDataReturnDetailPayloadVm {

  @ApiModelPropertyOptional()
  doPodReturnDetailId: string;

  @ApiModelPropertyOptional()
  doPodReturnId: string;
}

export class PhotoReturnDetailVm {
  @ApiModelProperty()
  doPodReturnDetailId: string;

  @ApiModelPropertyOptional({ example: 'photo, photoCod, signature' })
  attachmentType: string;
}