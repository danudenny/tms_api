import { MongoHelperService } from '../../../../shared/services/mongo-helper.service';
import { ConfigService } from '../../../../shared/services/config.service';

// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
export class MongoDbConfig {

  constructor() {}

  private static sicepatMonggoClient: any;

  public static async getSicepatMonggoClient() {
    if (!this.sicepatMonggoClient) {
      try {
        const urlMongo = ConfigService.get('mongodb.sicepat');
        const client = await MongoHelperService.connect(
          urlMongo,
        );
        this.sicepatMonggoClient = client;
        console.log('################ Connected Mongo firsttime!! =============');
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    return this.sicepatMonggoClient;
  }

  public static async getDbSicepatCod(collection: string) {
    const client = await this.getSicepatMonggoClient();
    return client.db('sicepat-cod').collection(collection);
  }

}
