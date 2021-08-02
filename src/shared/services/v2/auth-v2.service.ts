const crypto = require('crypto');
import axios from 'axios';
import moment = require('moment');
import ms = require('ms');
import { TokenExpiredError } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { LoginChannelOtpAddresses, LoginChannelOtpAddressesResponse} from '../../../servers/auth/models/auth.vm';
import { AuthLoginResultMetadataV2 } from '../../models/auth-login-result-metadata';
import { UserRepository } from '../../orm-repository/user.repository';
import { ConfigService } from '../config.service';
import { RequestErrorService } from '../request-error.service';
import { RedisService } from '../redis.service';
import { Employee } from '../../orm-entity/employee';
import { JwtRefreshTokenPayload } from '../../interfaces/jwt-payload.interface';
import { User } from '../../orm-entity/user';

@Injectable()
export class AuthV2Service {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async loginV2(
    clientId:string,
    username: string,
    password: string,
    email?: string,
  ): Promise<LoginChannelOtpAddressesResponse>{
    // find by email or username on table users
    const user = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );

    // // check user present
    // if (!user) {
    //   RequestErrorService.throwObj({
    //     message: 'global.error.USER_NOT_FOUND',
    //   });
    // }

    // // validate user password hash md5
    // if (!user.validatePassword(password)) {
    //   RequestErrorService.throwObj({
    //     message: 'global.error.LOGIN_WRONG_PASSWORD',
    //   });
    // }

    const url = `${ConfigService.get('svcOtp.baseUrl')}/auth/otp/lookup`
    const jsonData = {
      id: username,
    }
    const options = {
      headers: this.headerReqOtp,
    };

    const addresses = [];
    try {
      const response = await axios.post(url, jsonData, options);
      if (response.data && response.data.result){
        if (response.data.result.addresses.length < 1){
          RequestErrorService.throwObj({
            message: 'Nomor Handpone belum terdaftar, silahkan hubungi admin.',
          }, HttpStatus.FORBIDDEN);
        }

        for (const address of response.data.result.addresses) {
          const loginChannelOtpAddresses = new LoginChannelOtpAddresses();
          loginChannelOtpAddresses.channel = address.channel;
          loginChannelOtpAddresses.address = address.address;
          loginChannelOtpAddresses.enable = 'wa' == address.channel ? false : true;

          addresses.push({ ...loginChannelOtpAddresses });
        }
      } else {
        RequestErrorService.throwObj({
          message: 'User tidak terdaftar, silahkan hubungi admin.',
        }, HttpStatus.FORBIDDEN);
      }
    } catch (err) {
      let message = 'Request Time Out!';
      let statusCode = HttpStatus.REQUEST_TIMEOUT
      if (err.response && undefined != err.response.data) {
        console.log('error:::::', err.response.data)
        message = err.response.data.message ?
          err.response.data.message : err.response.data;
        statusCode = err.response.data.code;
      }
      if (err.response.message) {
        message = err.response.message;
        statusCode = err.response.statusCode;
      }

      RequestErrorService.throwObj({
        message: message,
      }, statusCode);
    }

    const text = `${user.userId}${moment().toDate()}`;
    const generateToken = crypto
      .createHash('md5')
      .update(text)
      .digest('hex');

    const value = {
      userId: user.userId,
      clientId: clientId,
    }

    await RedisService.setex(
      `pod:otp:${generateToken}`,
      JSON.stringify(value),
      300,
    );

    const result = new LoginChannelOtpAddressesResponse();
    result.token = generateToken;
    result.addresses = addresses;
    return result;
  }

  async getOtp(
    token: string,
    channel:string
  ):Promise<any>{

    const redisData = await RedisService.get(
      `pod:otp:${token}`,
      true,
    );

    if (!redisData){
      RequestErrorService.throwObj({
        message: 'Sesi login habis, Mohon login ulang',
      });
    }

    const userId = redisData.userId;
    const user = await this.userRepository.findByUserId(
      userId,
    );
    if (!user) {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }

    // const otpRetries = await RedisService.get(`pod:get:otp:${userId}`);
    // let retries = otpRetries ? Number(otpRetries) : 0;
    // if (retries >= 3) {
    //   RequestErrorService.throwObj({
    //     message: 'To many try otp input, wait a few seconds',
    //   });
    // }

    const url = `${ConfigService.get('svcOtp.baseUrl')}/otp`
    const jsonData = {
      channel: channel,
      id: user.username
    }
    const options = {
      headers: this.headerReqOtp,
    };

    try {
      const response = await axios.post(url, jsonData, options);
      // await RedisService.setex(
      //   `pod:get:otp:${userId}`,
      //   Number(retries + 1),
      //   60
      // );
      if (HttpStatus.NO_CONTENT == response.status){
        return {
          status: response.status,
          success: true};
      }
    } catch (err) {
      if (err.response && undefined != err.response.data) {
        console.log('error:::::', err.response.data)
        const message = err.response.data.message ?
          err.response.data.message : err.response.data;
        RequestErrorService.throwObj({
          message: message,
        }, err.response.data.code);
      } else {
        RequestErrorService.throwObj({
          message: 'Request Time Out!!',
        }, HttpStatus.REQUEST_TIMEOUT);
      }
    }
  }

  async validateOtp(
    code: string,
    token: string,
  ): Promise<AuthLoginResultMetadataV2>{

    const redisData = await RedisService.get(
      `pod:otp:${token}`,
      true,
    );

    if (!redisData) {
      RequestErrorService.throwObj({
        message: 'Sesi login habis, Mohon login ulang',
      });
    }

    const userId = redisData.userId;
    const user = await this.userRepository.findByUserId(
      userId,
    );

    if (!user) {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }

    const url = `${ConfigService.get('svcOtp.baseUrl')}/auth/otp`
    const jsonData = {
      code: code,
      id: user.username,
    }
    const options = {
      headers: this.headerReqOtp,
    };

    //bypass condition
    if (ConfigService.get('svcOtp.bypassCode') === code && ConfigService.get('svcOtp.isBypass')){
      const loginResultMetadata = this.populateLoginResultMetadataByUser(
        redisData.clientId,
        user,
      );
      await RedisService.del(`pod:otp:${token}`);
      return loginResultMetadata;
    }

    try {
      const response = await axios.post(url, jsonData, options);
      if (HttpStatus.OK == response.status){
        const loginResultMetadata = this.populateLoginResultMetadataByUser(
          redisData.clientId,
          user,
        );
        await RedisService.del(`pod:otp:${token}`);
        return loginResultMetadata;
      }
    } catch (err) {
      if(err.response && undefined != err.response.data){
        console.log('error:::::', err.response.data)
        const message = err.response.data.message ?
          err.response.data.message : err.response.data;
        RequestErrorService.throwObj({
          message: message,
        }, err.response.data.code);
      } else {
        RequestErrorService.throwObj({
          message: 'Request Time Out!!',
        }, HttpStatus.REQUEST_TIMEOUT);
      }
    }
  }

  async refreshAccessTokenV2(
    refreshToken: string,
  ): Promise<AuthLoginResultMetadataV2> {
    // TODO: find user on table or redis??
    const userLoginSession = await RedisService.get(`session:v2:${refreshToken}`);

    if (!userLoginSession) {
      RequestErrorService.throwObj(
        {
          message: 'global.error.LOGIN_SESSION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const refreshTokenPayload = this.verifyRefreshToken(refreshToken);
    const newLoginMetadata = this.populateLoginResultMetadataByUser(
      refreshTokenPayload.clientId,
      JSON.parse(userLoginSession),
    );
    if (newLoginMetadata) {
      // remove data on redis with refresh token
      await RedisService.del(`session:v2:${refreshToken}`);
    }
    return newLoginMetadata;
  }

  async populateLoginResultMetadataByUser(clientId: string, user: User) {
    // get data employee if employee id not null
    const employee = await this.getEmployeeById(user.employeeId);
    const employeeName = employee.employeeName;

    const accessToken = this.generateAccessToken(clientId, user, employeeName);
    const refreshToken = this.generateRefreshToken(clientId, user);

    // NOTE: set data user on redis
    // Set key to hold the string value and set key to timeout after a given number of seconds
    const expireInSeconds = Math.floor(
      ms(ConfigService.get('jwt.refreshTokenExpiration')) / 1000,
    );

    await RedisService.setex(
      `session:v2:${refreshToken}`,
      JSON.stringify(user),
      expireInSeconds,
    );

    const result = new AuthLoginResultMetadataV2();
    // Mapping response data
    result.userId = user.userId;
    result.accessToken = accessToken;
    result.refreshToken = refreshToken;
    result.email = user.email;
    result.username = user.username;
    result.employeeId = user.employeeId;
    result.displayName = employeeName;
    result.statusCode = HttpStatus.OK;
    // result.roles = map(user.roles, role => pick(role, ['role_id', 'role_name']));

    return result;
  }

  private get headerReqOtp() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async getEmployeeById(employeeId:number):Promise<Employee>{
    const employee = await Employee.findOne({
      where: {
        employeeId: employeeId,
        isDeleted: false,
      }
    })
    if (employee && employee.statusEmployee == 20) {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }
    return employee;
  }

  private generateAccessToken(
    clientId: string,
    user: User,
    employeeName: string,
    ){
    const jwtAccessTokenPayload = this.authService.populateJwtAccessTokenPayloadFromUser(
      clientId,
      user,
      employeeName,
    );

    const accessToken = this.jwtService.sign(jwtAccessTokenPayload, {
      expiresIn: ConfigService.get('jwt.accessTokenExpiration'),
    });

    return accessToken;
  }

  private generateRefreshToken(
    clientId: string,
    user: User,
  ){
    const jwtRefreshTokenPayload = this.authService.populateJwtRefreshTokenPayloadFromUser(
      clientId,
      user,
    );
    const refreshToken = this.jwtService.sign(jwtRefreshTokenPayload, {
      expiresIn: ConfigService.get('jwt.refreshTokenExpiration'),
    });

    return refreshToken;
  }

  private verifyRefreshToken(refreshToken: string){
    let refreshTokenPayload: JwtRefreshTokenPayload;
    try {
      refreshTokenPayload = this.jwtService.verify(refreshToken);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        RequestErrorService.throwObj(
          {
            message: 'global.error.REFRESH_TOKEN_EXPIRED',
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        RequestErrorService.throwObj(
          {
            message: 'global.error.REFRESH_TOKEN_NOT_VALID',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return refreshTokenPayload;
  }
}

