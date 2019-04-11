import axiosist from 'axiosist';

import TEST_GLOBAL_VARIABLE from './test-global-variable';

export class TestUtility {
  public static getUnauthenticatedAuthServerAxios() {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.auth.app.getHttpServer(),
    );

    return axios;
  }
  public static getAuthenticatedAuthServerAxios(
    loginType: 'superuser' = 'superuser',
  ) {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.auth.app.getHttpServer(),
    );
    const loginToken = this.getLoginToken(loginType);
    if (loginToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginToken}`;
    }
    return axios;
  }

  public static getAuthenticatedMainServerAxios(
    loginType: 'superuser' = 'superuser',
  ) {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.main.app.getHttpServer(),
    );
    const loginToken = this.getLoginToken(loginType);
    if (loginToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginToken}`;
    }

    return axios;
  }

  private static getLoginToken(
    loginType: 'superuser' = 'superuser',
  ): string {
    switch (loginType) {
      case 'superuser':
        return TEST_GLOBAL_VARIABLE.superuserLoginToken;
    }
  }
}
