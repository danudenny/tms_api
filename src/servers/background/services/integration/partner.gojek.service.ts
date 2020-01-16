import axios from 'axios';

export class PartnerGojekService {

  static async getEstimatePrice() {
    const urlPost =
      'https://integration-kilat-api.gojekapi.com/gokilat/v10/calculate/price';
    const headers = {
      'Client-ID': 'si-cepat-engine',
      'Pass-Key':
        '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
      'Content-Type': 'application/json',
    };

    const options = {
      headers,
      params: {
        origin: '-6.16496,106.823236',
        destination: '-6.166001,106.7766058',
        paymentType: 3,
      },
    };
    const response = await axios.get(urlPost, options);
    // console.log(response);
    console.log(response.status);
    return response.data;
  }

  static async getStatusOrder() {
    const urlPost =
      'https://integration-kilat-api.gojekapi.com/gokilat/v10/booking/orderno/' +
      'GK-366702';
    const headers = {
      'Client-ID': 'si-cepat-engine',
      'Pass-Key':
        '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
      'Content-Type': 'application/json',
    };

    const options = {
      headers,
    };
    const response = await axios.get(urlPost, options);
    // console.log(response);
    console.log(response.status);
    return response.data;
  }
}
