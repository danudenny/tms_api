const crypto = require('crypto');
import axios from 'axios';
import moment = require('moment');
import { TokenExpiredError } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { LoginChannelOtpAddresses, LoginChannelOtpAddressesResponse} from '../../../servers/auth/models/auth.vm';
import { AuthLoginResultMetadata } from '../../models/auth-login-result-metadata';
import { UserRepository } from '../../orm-repository/user.repository';
import { ConfigService } from '../config.service';
import { RequestErrorService } from '../request-error.service';
import { RedisService } from '../redis.service';
import { Employee } from '../../orm-entity/employee';
import { JwtRefreshTokenPayload } from '../../interfaces/jwt-payload.interface';




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

    // check user present
    if (!user) {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }

    // PinoLoggerService.log(user);
    // validate user password hash md5
    if (!user.validatePassword(password)) {
      RequestErrorService.throwObj({
        message: 'global.error.LOGIN_WRONG_PASSWORD',
      });
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

    const employee = await Employee.findOne({
      where: {
        employeeId: user.employeeId,
        isDeleted: false,
      }
    })

    if(employee && employee.statusEmployee == 20){
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }

    const channelList = ['wa', 'sms'];
    const addresses = [];
    for (const channel of channelList) {
      const loginChannelOtpAddresses = new LoginChannelOtpAddresses();
      loginChannelOtpAddresses.channel = channel;
      loginChannelOtpAddresses.adress = employee.phone1;
      loginChannelOtpAddresses.enable = 'wa' == channel ? false : true;

      addresses.push({ ...loginChannelOtpAddresses });
    }

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

    const url = `${ConfigService.get('getOtp.baseUrl')}/otp`
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
  ):Promise<AuthLoginResultMetadata>{

    const redisData = await RedisService.get(
      `pod:otp:${token}`,
      true,
    );

    if (!redisData) {
      RequestErrorService.throwObj({
        message: 'Data Not Found',
      });
    }

    const userId = redisData.userId;
    const user = await this.userRepository.findByUserId(
      userId,
    );

    if (!user) {
      RequestErrorService.throwObj({
        message: 'Sesi login habis, Mohon login ulang',
      });
    }

    const url = `${ConfigService.get('getOtp.baseUrl')}/auth/otp`
    const jsonData = {
      code: code,
      id: user.username,
    }
    const options = {
      headers: this.headerReqOtp,
    };

    try {
      const response = await axios.post(url, jsonData, options);
      if (HttpStatus.OK == response.status){
        const loginResultMetadata = this.authService.populateLoginResultMetadataByUser(
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
  ): Promise<AuthLoginResultMetadata> {
    // TODO: find user on table or redis??
    const loginSession = await RedisService.get(`session:v2:${refreshToken}`);

    if (!loginSession) {
      RequestErrorService.throwObj(
        {
          message: 'global.error.LOGIN_SESSION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

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

    // TODO: Populate AuthLoginResultMetadata and assign accessToken to the newly generated access token
    const newLoginMetadata = this.authService.populateLoginResultMetadataByUser(
      refreshTokenPayload.clientId,
      JSON.parse(loginSession),
    );
    if (newLoginMetadata) {
      // remove data on redis with refresh token
      await RedisService.del(`session:v2:${refreshToken}`);
    }
    return newLoginMetadata;
  }

  private get headerReqOtp() {
    return {
      'Content-Type': 'application/json',
    };
  }
}

