import axios from 'axios';

export class QueryServiceApi {
  public static async executeQuery(query, isCount, primaryField) {
    console.log(query);
    let paramQuery

    if(isCount == true){
      query = `SELECT COUNT(${primaryField}) as cnt FROM (${query}) t`;
      paramQuery = await Buffer.from(query).toString('base64');
    }else{
      paramQuery = await Buffer.from(query).toString('base64');
    }

    console.log(paramQuery);

    // const url = 'https://swagger.s.sicepat.tech/core/query-service/api/v1/collection/direct-exec';
    const url = 'http://api-internal.s.sicepat.io/core/query-service/api/v1/collection/direct-exec';
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    const body = {
      encoded_query: paramQuery
    };

    const request = await axios.post(url, body, options);
    if(isCount == true){
      if(request.status == 200){
        console.log(request.data);
        if(request.data.data[0].cnt){
          return request.data.data[0].cnt
        }else{
          return 0;
        }
      }else{
        return 0;
      }
    }else{
      if(request.status == 200){
        console.log(request.data);
        if(request.data.data){
          return request.data.data;
        }else{
          return [];
        }
      }else{
        return [];
      }
    }
  }
}