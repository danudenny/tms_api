import axios from 'axios';
import moment = require('moment');
import { Employee } from '../../../../shared/orm-entity/employee';
import { AwbSunfishLog } from '../../../../shared/orm-entity/awb-sunfish-log';
import { ConfigService } from '../../../../shared/services/config.service';

export class AwbSunfishService {
  public static async pushDataDlv(
    awbNumber: string,
    employeeId: number,
    historyDate: Date,
  ) {
    const FormData = require('form-data');

    const url = ConfigService.get('sunfish.postDlvUrl');
    const xSfApiHeaders = {
      'x-sfapi-account': ConfigService.get('sunfish.headerAccount'),
      'x-sfapi-appname': ConfigService.get('sunfish.headerAppname'),
      'x-sfapi-rsakey': ConfigService.get('sunfish.headerKey'),
    };

    const employee = await Employee.findOne({
      select: ['employeeId', 'nik'],
      where: {
        employeeId,
        isDeleted: false,
      },
      cache: true,
    });

    if (employee) {
      // moment.utc('2020-10-13 10:10:10').toISOString();
      const jsonData = {
        nik: employee.nik,
        awb: awbNumber,
        dlv_date: moment(historyDate).toISOString(),
      };

      const bodyFormData = new FormData();
      const requestData = JSON.stringify(jsonData);

      bodyFormData.append('jsondata', requestData);
      const formHeaders = bodyFormData.getHeaders();

      // console.log('#### jsonData :: ', jsonData);
      // console.log('#### bodyFormData :: ', bodyFormData);

      let responseStatus = 200;
      let responseData = '';
      try {
        const response = await axios.post(url, bodyFormData, {
          headers: {
            ...formHeaders,
            ...xSfApiHeaders,
          },
        });
        responseStatus = response.status;
        responseData = JSON.stringify(response.data);
      } catch (error) {
        console.log(error);
        responseStatus = error.response.status;
        responseData = JSON.stringify(error.response.data);
      }

      // insert table log
      const log = AwbSunfishLog.create({
        awbNumber,
        requestData,
        responseCode: responseStatus.toString(),
        responseData,
        dateTime: moment().toDate(),
      });
      await AwbSunfishLog.insert(log);

    }
  }

}
