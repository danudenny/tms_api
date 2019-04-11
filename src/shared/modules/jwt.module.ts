import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { ConfigService } from '../services/config.service';

@Module({
  imports: [
    NestJwtModule.register({
      secretOrPrivateKey: ConfigService.get('jwt.secretKey'),
      signOptions: {
        algorithm: 'HS256',
      },
      verifyOptions: {
        algorithms: ['HS256'],
        ignoreExpiration: false,
      },
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
