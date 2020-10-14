import axios from 'axios';
import moment = require('moment');
import { Employee } from '../../../../shared/orm-entity/employee';

export class AwbSunfishService {
  public static async pushDataDlv(
    awbNumber: string,
    employeeId: number,
    historyDate: Date,
  ) {
    const FormData = require('form-data');

    const url =
      'https://sfcola1.dataon.com/sfapi/index.cfm?endpoint=/sicepat_FULL_postDelivPaket';
    const xSfApiHeaders = {
      'x-sfapi-account': 'sicepat',
      'x-sfapi-appname': 'sfapi',
      'x-sfapi-rsakey':
        'MIIC1DCCAbwCAQAwgY4xCzAJBgNVBAYTAklEMRQwEgYDVQQIDAtES0kgSmFrYXJ0YTEUMBIGA1UEBwwLREtJIEpha2FydGExEDAOBgNVBAoMB1NJQ0VQQVQxDjAMBgNVBAsMBXNmYXBpMRAwDgYDVQQDDAdzaWNlcGF0MR8wHQYJKoZIhvcNAQkBFhB6YWtreUBkYXRhb24uY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApcrWbXVUOCzvB+bs0kRjKw7LoWtLTN601J/yGizYMSLYhm/FNbWBzfaDhdlqpplYWkGUB3ZQ07fmFGKiOJUhSX3MB0lYWKQL88jHivnWG0mprI+/vhOxbJj5bb3i0aCFoz1kKm+P42cV6m5V+hyrW8qcsf8YBrY74Dhfie3ZthTEgKfUyXYV6YiVJUmLQdwg3ltFzwKDLWba/DQa3MtKfi3zbzGXN7cdmC9ajsktTOG3REOy5+ln0VzorqPYnAlUMKCb4mZjrKqmLZzmIgIpNQn6Yb3FsD5WOSzgDT7GQlFx+6W1gqstZquE5RR3qYfAMhywQ3OsdjBFZ7TV16K27QIDAQABoAAwDQYJKoZIhvcNAQELBQADggEBAJJSN5MYRK0rWlNrnfY3K+MMuvy9C08AzGRwc5CkEatk6/18Q8r4jx4FMVgKmdPpUNcffh0UkNs2vrtQBajJE/UND7ex444QiEF7j3efJsleQdvF6FzfM+yUZdOdIQUgRfg5O8QFRa068amkoPiMzXnLUbwi7sHTHZpkBVVoLO9hUk/xek1yX6DApZ6V8gNy3lyIX8PpD7DjBQ5pfDQCC6r4PdDKLjy7hCXFJjkwCetDz0YlzXuaH3oqb7i1ZWCHUkYyDgqCIJUekG+OaXQvECn/1tt9eo9+EtAZoOz8gtDlee83e2kClwMviRCds55NnHc5SpAapxHI4M6u6zrgDfo=',
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
      bodyFormData.append('jsondata', JSON.stringify(jsonData));
      const formHeaders = bodyFormData.getHeaders();

      console.log('#### jsonData :: ', jsonData);
      console.log('#### bodyFormData :: ', bodyFormData);

      try {
        const response = await axios.post(url, bodyFormData, {
          headers: {
            ...formHeaders,
            ...xSfApiHeaders,
          },
        });
        return response.data;
      } catch (error) {
        return { error: true, message: 'error' };
      }
    }
  }

}
