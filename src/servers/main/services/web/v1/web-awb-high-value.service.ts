import { BadRequestException } from '@nestjs/common';

import xlsx = require('xlsx');
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { AwbHighValueUploadResponseVm } from '../../../models/last-mile/awb-high-value.vm';
import { getManager } from 'typeorm';

export class V1WebAwbHighValueService {

  static async uploadAwb(file): Promise<AwbHighValueUploadResponseVm> {
    let totalValid = 0;
    const notValid = [];
    if (file) {
      const workbook: any = xlsx.read(file.buffer);

      const xlData: Array<{ awbNumber }> = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      if (!xlData[0].awbNumber) {
        throw new BadRequestException(
          'field awbNumber tidak ditemukan!',
        );
      }

      const uniqueData = [...new Set(xlData.map(p => p.awbNumber))];

      for (const item of uniqueData) {
        let awbNumber = item.toString().replace(/[^a-zA-Z0-9]/g, '');
        awbNumber = awbNumber.padStart(12, '0');

        const awb = await AwbItemAttr.findOne({
          select: ['awbNumber', 'awbItemId', 'isHighValue'],
          where: {
            awbNumber,
            isDeleted: false,
          },
        });

        if (awb) {
          // TODO: find table awb for validate data
          // update flag isHighValue (new field)
          // after success insert to table awbHighValue
          if (awb.isHighValue == true) {
            notValid.push(`Data ${item} sudah diproses!`);
          } else {
            try {
              await getManager().transaction(async transactionManager => {
                await transactionManager.update(
                  AwbItemAttr,
                  {
                    awbItemId: awb.awbItemId,
                    isDeleted: false,
                  },
                  {
                    isHighValue: true,
                  },
                );
                totalValid += 1;
              });
              // TODO: insert table log awbHighValue
            } catch (error) {
              console.error(error);
              notValid.push(`Server error, coba lagi!`);
            }
          }
        } else {
          notValid.push(`Data ${item} tidak ditemukan!`);
        }
      }

      // construct response
      const result = new AwbHighValueUploadResponseVm();
      result.notValid = notValid;
      result.totalValid = totalValid;
      result.totalNotValid = notValid.length;
      return result;
    } else {
      throw new BadRequestException('file mandatory!');
    }
  }

}
