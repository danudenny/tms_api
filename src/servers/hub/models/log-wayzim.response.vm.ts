import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class LogwayzimPayloadVm {

  @ApiModelProperty({
    example: 12,
  })
  @IsDefined({ message: 'branch_id tidak boleh kosong' })
  branch_id?: number;

  @ApiModelProperty({
    example: '1203123312',
  })
  @IsDefined({ message: 'awb_number tidak boleh kosong' })
  awb_number?: string;

  @ApiModelProperty({
    example: 1,
  })
  @IsDefined({ message: 'is_succeed tidak boleh kosong' })
  is_succeed?: number;

  @ApiModelProperty({
    example: 'District NULL for AWB: 1203123312',
  })
  @IsDefined({ message: 'reason tidak boleh kosong' })
  reason?: string;

  @ApiModelProperty({
    example: '11111IKB',
  })
  @IsDefined({ message: 'seal_number tidak boleh kosong' })
  seal_number?: string;

  @ApiModelProperty({
    example: '13K',
  })
  @IsDefined({ message: 'chute number is mendatory' })
  @IsNotEmpty({ message: 'chute_number is mendatory' })
  chute_number: string;

  @ApiModelProperty({
    example: true,
  })
  @IsDefined({ message: 'is_cod tidak boleh kosong' })
  is_cod?: boolean;

  @ApiModelProperty({
    example: '2021-08-25 07:27:00',
  })
  scan_date?: string;

  @ApiModelProperty({
    example: 1234,
  })
  branch_id_lastmile?: number;
}

export class LogwayzimResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;
}