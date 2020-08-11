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
import { SmdServerControllersModule } from './controllers/smd-server-controllers.module';
import { SmdServerInjectorService } from './services/smd-server-injector.service';
import { SmdServerServicesModule } from './services/smd-server-services.module';
import { LogglyMiddleware } from '../../shared/middlewares/loggly.middleware';

@Module({
  imports: [SharedModule, SmdServerControllersModule, LoggingInterceptor, SmdServerServicesModule],
})
export class SmdServerModule extends MultiServerAppModule implements NestModule {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
    SmdServerInjectorService.setModuleRef(this.moduleRef);
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
    const serverConfig = ConfigService.get('servers.smd');

    let app: any;
    if (process.env.NODE_ENV === 'test') {
      const { Test } = require('@nestjs/testing');
      app = (await Test.createTestingModule({
        imports: [SmdServerModule],
      }).compile()).createNestApplication();
    } else {
      app = await NestFactory.create(
        SmdServerModule,
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

    // NOTE: bull-board
    // https://www.npmjs.com/package/bull-board
    if (serverConfig.bullBoard) {
      const { UI } = require('bull-board');
      app.use('/bull/queues', UI);
    }

    if (process.env.NODE_ENV === 'test') {
      await app.init();
    } else {
      await app.listen(process.env.PORT || serverConfig.port, serverConfig.host || '0.0.0.0');
    }
  }
}
