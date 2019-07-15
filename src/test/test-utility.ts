import axiosist from 'axiosist';

import TEST_GLOBAL_VARIABLE from './test-global-variable';

type TestUtilityLoginType = 'web' | 'mobile' | 'partner';

export class TestUtility {
  public static getUnauthenticatedAuthServerAxios() {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.auth.app.getHttpServer(),
    );

    return axios;
  }

  public static getAuthenticatedAuthServerAxios(
    loginType: TestUtilityLoginType = 'web',
  ) {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.auth.app.getHttpServer(),
    );
    const loginToken = this.getAccessToken(loginType);
    if (loginToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginToken}`;
    }
    return axios;
  }

  public static getAuthenticatedMainServerAxios(
    loginType: TestUtilityLoginType = 'web',
  ) {
    const axios = axiosist(
      TEST_GLOBAL_VARIABLE.serverModules.main.app.getHttpServer(),
    );
    const loginToken = this.getAccessToken(loginType);
    if (loginToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginToken}`;
    }

    const permissionToken = this.getPermissionToken(loginType);
    if (permissionToken) {
      axios.defaults.headers.common['x-permission-token'] = permissionToken;
    }

    return axios;
  }

  private static getAccessToken(
    loginType: TestUtilityLoginType = 'web',
  ): string {
    switch (loginType) {
      case 'web':
        return TEST_GLOBAL_VARIABLE.webUserLogin.accessToken;
      case 'mobile':
        return TEST_GLOBAL_VARIABLE.mobileUserLogin.accessToken;
    }
  }

  private static getPermissionToken(
    loginType: TestUtilityLoginType = 'web',
  ): string {
    switch (loginType) {
      case 'web':
        return TEST_GLOBAL_VARIABLE.webUserPermissionToken;
      case 'mobile':
        return TEST_GLOBAL_VARIABLE.mobileUserPermissionToken;
    }
  }
}
