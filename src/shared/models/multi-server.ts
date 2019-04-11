import { INestApplication } from '@nestjs/common';

export class MultiServerAppModule {
  public static app: INestApplication;
  public static async bootServer() {}

  public static async stopServer() {
    if (this.app) {
      await this.app.close();
    }
  }
}
