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
import { MainServerControllersModule } from './controllers/main-server-controllers.module';
import { MainServerInjectorService } from './services/main-server-injector.service';
import { MainServerServicesModule } from './services/main-server-services.module';

@Module({
  imports: [SharedModule, MainServerControllersModule, LoggingInterceptor, MainServerServicesModule],
})
export class MainServerModule extends MultiServerAppModule implements NestModule {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
    MainServerInjectorService.setModuleRef(this.moduleRef);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestContextMiddleware,
        HeaderMetadataMiddleware,
        AuthMiddleware,
      )
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }

  public static async bootServer() {
    const serverConfig = ConfigService.get('servers.main');

    let app: any;
    if (process.env.NODE_ENV === 'test') {
      const { Test } = require('@nestjs/testing');
      app = (await Test.createTestingModule({
        imports: [MainServerModule],
      }).compile()).createNestApplication();
    } else {
      app = await NestFactory.create(
        MainServerModule,
        {
          logger: new PinoLoggerService(),
        },
      );
    }

    this.app = app;

    app.enableCors({ origin: true });

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
  }
}
