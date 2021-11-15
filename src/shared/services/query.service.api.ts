import axios from 'axios';

export class QueryServiceApi {
  public static async executeQuery(query) {
    console.log(query);
    let paramQuery = await Buffer.from(query).toString('base64');
    const url = 'https://swagger.s.sicepat.tech/core/query-service/api/v1/collection/direct-exec';
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    const qs = require('querystring');
    const body = {
      encoded_query: paramQuery
    };

    const request = await axios.post(url, body, options);
    if(request.status == 200){
      console.log(request.data);
      return request.data;
    }else{
      return [];
    }
  }
}