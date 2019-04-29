import { MiddlewareConsumer, Module, NestModule, RequestMethod, Injectable, Inject, forwardRef } from '@nestjs/common';
import { ModuleRef, NestFactory } from '@nestjs/core';
// import { Test } from '@nestjs/testing';

import { DocumentBuilder, SwaggerModule }  from '@nestjs/swagger';
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

@Injectable()
@Module({
  imports: [SharedModule, AuthServerControllersModule],
})
export class AuthServerModule extends MultiServerAppModule implements NestModule {
  // moduleRef: ModuleRef;
  constructor(private readonly moduleRef: ModuleRef) {
    // constructor(@Inject(forwardRef(() => ModuleRef)) private ModuleRef: ModuleRef) {
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
    //     ? (await test.createTestingModule({
    //         imports: [AuthServerModule],
    //       }).compile()).createNestApplication()
    //     : await NestFactory.create(AuthServerModule);
    const app = await NestFactory.create<NestFastifyApplication>(
      AuthServerModule,
      new FastifyAdapter({ logger: true }),
    );
    this.app = app;

    app.enableCors();

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
      new ErrorHandlerInterceptor(),
    );

    if (serverConfig.swagger.enabled) {
      const swaggerModule = new SwaggerModule();
      const options = new DocumentBuilder()
        .setTitle(serverConfig.swagger.title)
        .setDescription(serverConfig.swagger.description)
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      // const document = swaggerModule.createDocument(app, options);
      // swaggerModule.setup(serverConfig.swagger.path, app, document);
    }

    if (process.env.NODE_ENV === 'test') {
      await app.init();
    } else {
      await app.listen(process.env.PORT || serverConfig.port);
    }
  }
}
