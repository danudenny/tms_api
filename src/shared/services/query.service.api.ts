import axios from 'axios';
import {ConfigService} from '../../shared/services/config.service';

export class QueryServiceApi {
  public static get queryServiceUrl() {
    return ConfigService.get('queryService.baseUrl');
  }

  public static async executeQuery(query, isCount, primaryField) {
    let paramQuery
    // query = query.replace(/public/g, ConfigService.get('queryService.schema'));// only dev mode n staging

    if(isCount == true){
      query = `SELECT COUNT(1) as cnt FROM (${query}) t`;
      paramQuery = await Buffer.from(query).toString('base64');
    }else{
      paramQuery = await Buffer.from(query).toString('base64');
    }

    let url = `${this.queryServiceUrl}collection/direct-exec`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    const body = {
      encoded_query: paramQuery
    };

    try{
      const request = await axios.post(url, body, options);
      if(isCount){
        return request.data.data[0].cnt
      }else{
        if(!request.data.data){
          return [];
        }else{
          return request.data.data;
        }
      }
    }catch(err){
      console.log("#### error calling query service query", query, ", error: ", err.message);
      if(isCount == true){
        return 0;
      }else{
        return [];
      }
    }
  }
}