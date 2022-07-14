import { PodProsparkResponse } from '../../models/pod-prospark-response.vm'
import { AuthService } from '../../../../shared/services/auth.service';
import axios from 'axios';
import {ConfigService} from '../../../../shared/services/config.service';
import { Employee } from '../../../../shared/orm-entity/employee';

export class PodProsparkService {
  public static get prosparkUrl() {
    return ConfigService.get('podProsparkService.baseUrl');
  }

  public static get prosparkKey() {
    return ConfigService.get('podProsparkService.key');
  }

  public static async getCallback() {
    const authMeta = AuthService.getAuthData();
    const response = new PodProsparkResponse();
    // let employee = await Employee.findOne({
    //   select : ['nik'],
    //   where :{
    //     employeeId : authMeta.employeeId,
    //   }
    // });

    let employee ={
      nik : '06022019',
    }

    if(employee.nik){
      const url = `${this.prosparkUrl}`;
      const options = {
        headers: {
          'api-key': `${this.prosparkKey}`,
          'Content-Type': 'application/json',
        },
      };

      const body = {
        nik: employee.nik,
        client : 'prospark'
      };

      try{
        const request = await axios.post(url, body, options);
        response.status = request.status
        if(request.status == 200){
          response.message = 'ok'
          response.callback = request.data.callback
        }else{
          response.message = request.data.message
        }
        return response;
      }catch(err){
        response.status = 500
        response.message = 'Error dalam hit services '+err
        return response
      }
    }else{
      response.status = 400
      response.message = 'Data karyawan tidak ditemukan'
      return response
    }    
  }
}