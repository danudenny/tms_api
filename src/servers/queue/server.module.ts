// #region import
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ModuleRef, NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '../../shared/external/nestjs-swagger';
import { AllExceptionsFilter } from '../../shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from '../../shared/interceptors/logging.interceptor';
import { ResponseSerializerInterceptor } from '../../shared/interceptors/response-serializer.interceptor';
import { AuthMiddleware } from '../../shared/middlewares/auth.middleware';
import { HeaderMetadataMiddleware } from '../../shared/middlewares/header-metadata.middleware';
import { RequestContextMiddleware } from '../../shared/middlewares/request-context.middleware';
import { MultiServerAppModule } from '../../shared/models/multi-server';
import { RequestValidationPipe } from '../../shared/pipes/request-validation-pipe.pipe';
import { ConfigService } from '../../shared/services/config.service';
import { PinoLoggerService } from '../../shared/services/pino-logger.service';
import { SharedModule } from '../../shared/shared.module';
import { DoPodDetailPostMetaQueueService } from './services/do-pod-detail-post-meta-queue.service';
import { QueueServerInjectorService } from './services/queue-server-injector.service';
import { QueueServerServicesModule } from './services/queue-server-services.module';
import { BagItemHistoryQueueService } from './services/bag-item-history-queue.service';
import { MappingRoleQueueService } from './services/mapping-role-queue.service';
import { BagScanOutBranchQueueService } from './services/bag-scan-out-branch-queue.service';
import { LogglyMiddleware } from '../../shared/middlewares/loggly.middleware';
import { BagScanOutHubQueueService } from './services/bag-scan-out-hub-queue.service';
import { AwbSendPartnerQueueService } from './services/awb-send-partner-queue.service';
import { BagDropoffHubQueueService } from './services/bag-dropoff-hub-queue.service';
import { UploadImagePodQueueService } from './services/upload-pod-image-queue.service';
import { DoSmdPostAwbHistoryMetaQueueService } from './services/do-smd-post-awb-history-meta-queue.service';
import { BagScanInBranchSmdQueueService } from './services/bag-scan-in-branch-smd-queue.service';
import { BagScanOutBranchSmdQueueService } from './services/bag-scan-out-branch-smd-queue.service';
import { BagScanDoSmdQueueService } from './services/bag-scan-do-smd-queue.service';
import { BagAwbDeleteHistoryInHubFromSmdQueueService } from './services/bag-awb-delete-history-in-hub-from-smd-queue.service';
import { BagRepresentativeSmdQueueService } from './services/bag-representative-smd-queue.service';
import { BagRepresentativeScanDoSmdQueueService } from './services/bag-representative-scan-do-smd-queue.service';
import { BagRepresentativeDropoffHubQueueService } from './services/bag-representative-dropoff-hub-queue.service';
import { BaggingDropoffHubQueueService } from './services/bagging-dropoff-hub-queue.service';
import { CreateBagFirstScanHubQueueService } from './services/create-bag-first-scan-hub-queue.service';
import { CreateBagAwbScanHubQueueService } from './services/create-bag-awb-scan-hub-queue.service';
import { CodPaymentQueueService } from './services/cod-payment-queue.service';
import { CodFirstTransactionQueueService } from './services/cod/cod-first-transaction-queue.service';
import { CodSyncTransactionQueueService } from './services/cod/cod-sync-transaction-queue.service';
import { CodUpdateTransactionQueueService } from './services/cod/cod-update-transaction-queue.service';
import { CodTransactionHistoryQueueService } from './services/cod/cod-transaction-history-queue.service';
import { CodUpdateSupplierInvoiceQueueService } from './services/cod/cod-update-supplier-invoice-queue.service';
import { CodCronSettlementQueueService } from './services/cod/cod-cron-settlement-queue.service';
import { MongoDbConfig } from './config/database/mongodb.config';
import { CodExportMongoQueueService } from './services/cod/cod-export-queue.service';
import { BagRepresentativeScanOutHubQueueService } from './services/bag-representative-scan-out-hub-queue.service';
import { BagScanVendorQueueService } from './services/bag-scan-vendor-queue.service';
import { CodSqlExportMongoQueueService } from './services/cod/cod-sql-export-queue.service';
import { AwbNotificationMailQueueService } from './services/notification/awb-notification-mail-queue.service';
// #endregion import
@Module({
  imports: [SharedModule, LoggingInterceptor, QueueServerServicesModule],
})
export class QueueServerModule extends MultiServerAppModule implements NestModule {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
    QueueServerInjectorService.setModuleRef(this.moduleRef);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        LogglyMiddleware,
        HeaderMetadataMiddleware,
        AuthMiddleware,
      )
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }

  public static async bootServer() {
    const serverConfig = ConfigService.get('servers.queue');

    let app: any;
    if (process.env.NODE_ENV === 'test') {
      const { Test } = require('@nestjs/testing');
      app = (await Test.createTestingModule({
        imports: [QueueServerModule],
      }).compile()).createNestApplication();
    } else {
      app = await NestFactory.create(
        QueueServerModule,
        {
          logger: new PinoLoggerService(),
        },
      );
    }
    this.app = app;

    app.enableCors();
    app.use(RequestContextMiddleware.rawExpressMiddleware);
    app.useGlobalPipes(
      new RequestValidationPipe({
        transform: true,
        transformOptions: {
          strategy: 'excludeAll',
        },
      }),
    );
    app.useGlobalInterceptors(
      new ResponseSerializerInterceptor(),
      new LoggingInterceptor(),
    );
    app.useGlobalFilters(
      new AllExceptionsFilter(),
    );

    if (serverConfig.swagger.enabled) {
      const swaggerModule = new SwaggerModule();
      const options = new DocumentBuilder()
        .setTitle(serverConfig.swagger.title)
        .setDescription(
          serverConfig.swagger.description,
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = swaggerModule.createDocument(app, options);
      swaggerModule.setup(
        serverConfig.swagger.path,
        app,
        document,
      );
    }

    if (process.env.NODE_ENV === 'test') {
      await app.init();
    } else {
      await app.listen(process.env.PORT || serverConfig.port, serverConfig.host || '0.0.0.0');
    }

    // init connection mongodb
    MongoDbConfig.getSicepatMonggoClient();
    // init boot Queue
    DoPodDetailPostMetaQueueService.boot();
    BagItemHistoryQueueService.boot();
    BagScanOutBranchQueueService.boot();
    BagScanOutHubQueueService.boot();
    MappingRoleQueueService.boot();
    // AwbSendPartnerQueueService.boot();
    BagDropoffHubQueueService.boot();
    UploadImagePodQueueService.boot();
    CreateBagFirstScanHubQueueService.boot();
    CreateBagAwbScanHubQueueService.boot();

    if (serverConfig.bullPod) {
      AwbNotificationMailQueueService.boot();
    }

    if (serverConfig.bullCod) {
      // CodPaymentQueueService.boot();
      CodFirstTransactionQueueService.boot();
      CodSyncTransactionQueueService.boot();
      CodUpdateTransactionQueueService.boot();
      CodTransactionHistoryQueueService.boot();
      CodUpdateSupplierInvoiceQueueService.boot();
      CodExportMongoQueueService.boot();
      CodSqlExportMongoQueueService.boot();
      // init Cron here
      CodCronSettlementQueueService.init();
    }

    if (serverConfig.bullSmd) {
      BagRepresentativeScanOutHubQueueService.boot();
      BagScanVendorQueueService.boot();
      DoSmdPostAwbHistoryMetaQueueService.boot();
      BagScanInBranchSmdQueueService.boot();
      BagScanOutBranchSmdQueueService.boot();
      BagScanDoSmdQueueService.boot();
      BagRepresentativeScanDoSmdQueueService.boot();
      BagAwbDeleteHistoryInHubFromSmdQueueService.boot();
      BagRepresentativeSmdQueueService.boot();
      BaggingDropoffHubQueueService.boot();
      BagRepresentativeDropoffHubQueueService.boot();
    }

  }
}
