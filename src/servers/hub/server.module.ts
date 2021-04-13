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
import { LogglyMiddleware } from '../../shared/middlewares/loggly.middleware';
import { urlencoded, json } from 'express';
import { HubServerServicesModule } from './services/hub-server-services.module';
import { HubServerControllersModule } from './controllers/hub-server-controllers.module';
import { HubServerInjectorService } from './services/hub-server-injector.service';

@Module({
  imports: [SharedModule, HubServerControllersModule, LoggingInterceptor, HubServerServicesModule],
})
export class HubServerModule extends MultiServerAppModule implements NestModule {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
    HubServerInjectorService.setModuleRef(this.moduleRef);
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
    const serverConfig = ConfigService.get('servers.hub');

    let app: any;
    if (process.env.NODE_ENV === 'test') {
      const { Test } = require('@nestjs/testing');
      app = (await Test.createTestingModule({
        imports: [HubServerModule],
      }).compile()).createNestApplication();
    } else {
      app = await NestFactory.create(
        HubServerModule,
        {
          logger: new PinoLoggerService(),
        },
      );
    }

    this.app = app;
    // NOTE: The default limit defined by body-parser is 100kb
    // https://github.com/expressjs/body-parser/blob/0632e2f378d53579b6b2e4402258f4406e62ac6f/lib/types/json.js#L53-L55
    app.use(json({ limit: '20mb' }));
    app.use(urlencoded({ extended: true, limit: '20mb' }));
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
