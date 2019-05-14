import { MiddlewareConsumer, Module, NestModule, RequestMethod, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ModuleRef, NestFactory } from '@nestjs/core';
// import { Test } from '@nestjs/testing';
// import { DocumentBuilder, SwaggerModule } from '../../shared/external/nestjs-swagger';
// import { PinoLoggerService } from '../../shared/common/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../shared/interceptors/logging.interceptor';
import { HttpExceptionFilter} from '../../shared/interceptors/http-exception.filter';
import { ErrorHandlerInterceptor } from '../../shared/interceptors/error-handler.interceptor';
import { ResponseSerializerInterceptor } from '../../shared/interceptors/response-serializer.interceptor';
import { AuthMiddleware } from '../../shared/middlewares/auth.middleware';
import { HeaderMetadataMiddleware } from '../../shared/middlewares/header-metadata.middleware';
import { RequestContextMiddleware } from '../../shared/middlewares/request-context.middleware';
import { MultiServerAppModule } from '../../shared/models/multi-server';
import { RequestValidationPipe } from '../../shared/pipes/request-validation-pipe.pipe';
import { ConfigService } from '../../shared/services/config.service';
import { SharedModule } from '../../shared/shared.module';
import { AuthServerControllersModule } from './controllers/auth-server-controllers.module';
import { AuthServerInjectorService } from './services/auth-server-injector.service';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { PinoLoggerService } from '../main/services/logger.service';

@Module({
  imports: [SharedModule, AuthServerControllersModule],
})

export class AuthServerModule extends MultiServerAppModule implements NestModule {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
    AuthServerInjectorService.setModuleRef(this.moduleRef);
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
    const serverConfig = ConfigService.get('servers.auth');
    // const app =
    //   process.env.NODE_ENV === 'test'
    //     ? (await Test.createTestingModule({
    //         imports: [AuthServerModule],
    //       }).compile()).createNestApplication()
    //     : await NestFactory.create(AuthServerModule);

    // NOTE: adapter with fastify
    const app = await NestFactory.create<NestFastifyApplication>(
      AuthServerModule,
      new FastifyAdapter({ logger: PinoLoggerService }),
    );
    this.app = app;

    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          strategy: 'excludeAll',
        },
      }),
    );
    app.useGlobalFilters(
      new HttpExceptionFilter(),
    );

    app.useGlobalInterceptors(
      new ResponseSerializerInterceptor(),
      new ErrorHandlerInterceptor(),
      new LoggingInterceptor(),

    );

    if (serverConfig.swagger.enabled) {
      // NOTE: swagger doc with fastify
      const options = new DocumentBuilder()
        .setTitle(serverConfig.swagger.title)
        .setDescription(serverConfig.swagger.description)
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup(serverConfig.swagger.path, app, document);

      // const swaggerModule = new SwaggerModule();
      // const options = new DocumentBuilder()
      //   .setTitle(serverConfig.swagger.title)
      //   .setDescription(serverConfig.swagger.description)
      //   .setVersion('1.0')
      //   .addBearerAuth()
      //   .build();
      // const document = SwaggerModule.createDocument(app, options);
      // SwaggerModule.setup(serverConfig.swagger.path, app, document);
    }

    if (process.env.NODE_ENV === 'test') {
      await app.init();
    } else {
      await app.listen(process.env.PORT || serverConfig.port);
    }
  }
}
