var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

export abstract class DatabaseCodConfig {
  private static sicepatMonggoConnectionString: string = 'mongodb+srv://christian:Christi4N888_@sicepat-staging-cluster.nrgvr.mongodb.net?retryWrites=true&w=majority';
  private static sicepatMonggoClient: any;

  /// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect
  public static async getSicepatMonggoClient() {
    if (!this.sicepatMonggoClient) {
      try {
        const client = await MongoClient.connect(this.sicepatMonggoConnectionString, { useNewUrlParser: true });
        this.sicepatMonggoClient = client;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    return this.sicepatMonggoClient;
  }


  public static async getSicepatPickupMonitoringMonggoDb() {
    const client = await this.getSicepatMonggoClient();
    return client.db('sicepat-cod');
  }
}