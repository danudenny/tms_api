const crypto = require('crypto');
import moment = require('moment');
import axios from 'axios';
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
import { MESSAGE_ERROR_OTP } from '../../constants/auth-otp-error.constant';
import { SharedService } from '../shared.service';

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

    if (!user.validatePasswordPolicy(password)) {
      RequestErrorService.throwObj({
        message: 'global.error.PASSWORD_POLICY_INVALID',
      });
    }

    await this.authService.blockProcess(username);
    // validate user password hash md5
    if (!user.validatePassword(password)) {
      await this.authService.addBlockCounter(username);

      RequestErrorService.throwObj({
        message: 'global.error.LOGIN_WRONG_PASSWORD',
      });
    }

    await this.getEmployeeById(user.employeeId);//check employee is active or not

    let addresses = [];
    const isOtpRequired = await this.isOtpRequired(clientId, user.username);
    if(isOtpRequired){
      addresses = await this.getAddress(user.username);
    }

    const generateToken = await this.generateToken(user.userId, clientId);

    await RedisService.setex(
      `pod:otp:${generateToken}`,
      JSON.stringify({ userId: user.userId, clientId: clientId,}),
      300,
    );

    await this.authService.removeBlockCounter(username);

    const result = new LoginChannelOtpAddressesResponse();
    result.token = generateToken;
    result.isOtpRequired = isOtpRequired;
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

    const isRequiredOtp = await this.isOtpRequired(redisData.clientId, user.username);
    if(!isRequiredOtp){
      return {
        status: HttpStatus.OK,
        success: true
      };
    }

    const url = `${ConfigService.get('svcOtp.baseUrl')}/otp`
    const jsonData = {
      channel: channel,
      id: user.username,
      source: `pod-${redisData.clientId}`
    }
    const options = {
      headers: this.headerReqOtp,
    };

    try {
      const response = await axios.post(url, jsonData, options);
      if (HttpStatus.NO_CONTENT == response.status){
        return {
          status: response.status,
          success: true};
      }
    } catch (err) {
      if (err.response && undefined != err.response.data) {
        console.log('error:::::', err.response.data)
        const messageResponse = await this.messageErrorAuthOtp(err.response.data);
        RequestErrorService.throwObj({
          message: messageResponse,
        }, err.response.status == 500 ? HttpStatus.BAD_REQUEST : err.response.status);
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

    const isOtpRequired = await this.isOtpRequired(redisData.clientId, user.username);
    if (isOtpRequired && code == '') {
      RequestErrorService.throwObj({
        message: 'kode otp tidak boleh kosong.',
      });
    }

    //bypass condition
    if (!isOtpRequired || (ConfigService.get('svcOtp.bypassCode') === code && ConfigService.get('svcOtp.isBypass'))){
      const loginResultMetadata = this.populateLoginResultMetadataByUser(
        redisData.clientId,
        user,
      );
      await RedisService.del(`pod:otp:${token}`);
      return loginResultMetadata;
    }

    const url = `${ConfigService.get('svcOtp.baseUrl')}/auth/otp`
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
        const messageResponse = await this.messageErrorAuthOtp(err.response.data);
        RequestErrorService.throwObj({
          message: messageResponse,
        }, err.response.status == 500 ? HttpStatus.BAD_REQUEST : err.response.status);
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
      false,
      refreshToken,
    );
    if (newLoginMetadata) {
      // remove data on redis with refresh token
      await RedisService.del(`session:v2:${refreshToken}`);
    }
    return newLoginMetadata;
  }

  async populateLoginResultMetadataByUser(clientId: string, user: User, isFromLogin:boolean = true, refreshedToken:string = null) {
    // get data employee if employee id not null
    const employee = await this.getEmployeeById(user.employeeId);
    const employeeName = employee.employeeName;
    let refreshToken = refreshedToken;

    if(employee.isDeleted == true || employee.statusEmployee == 20){
      RequestErrorService.throwObj({
        message: 'User non aktif, OTP tidak dapat di kirim! Silahkan hubungi IT',
      });
    }

    const accessToken = this.generateAccessToken(clientId, user, employeeName);

    if(isFromLogin == true){
      refreshToken = this.generateRefreshToken(clientId, user);
    }

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

  private async getAddress(userName: string): Promise<Array<LoginChannelOtpAddresses>> {
    const url = `${ConfigService.get('svcOtp.baseUrl')}/auth/otp/lookup`
    const jsonData = {
      id: userName,
    }
    const options = {
      headers: this.headerReqOtp,
    };

    let response;
    try {
      response = await axios.post(url, jsonData, options);
      console.log('response:::', response);
    } catch (err) {
      let message = 'Terjadi Kesalahan Sistem';
      let statusCode = HttpStatus.REQUEST_TIMEOUT
      if (err.response && undefined != err.response.data) {
        console.log('ERROR::', err.response.data)
        message = err.response.data.message ?
          err.response.data.message : err.response.data;
        statusCode = err.response.data.code;
      }

      console.log('ERROR::::', err)
      RequestErrorService.throwObj({
        message: message,
      }, statusCode);
    }

    if(!response || !response.data || !response.data.result){
      RequestErrorService.throwObj({
        message: 'User tidak terdaftar, silahkan hubungi admin.',
      }, HttpStatus.FORBIDDEN);
    }

    if (!response.data.result.addresses || response.data.result.addresses.length < 1) {
      RequestErrorService.throwObj({
        message: 'Nomor Handpone belum terdaftar, silahkan hubungi admin.',
      }, HttpStatus.FORBIDDEN);
    }

    const sortChannel = String(ConfigService.get('svcOtp.sortChannel')).split(',');

    let whiteListUserData  = await RedisService.get(
      `pod:required:otp`,
      true,
    );

    const addresses = [];
    for (const address of response.data.result.addresses) {
      const loginChannelOtpAddresses = new LoginChannelOtpAddresses();
      loginChannelOtpAddresses.channel = address.channel;
      loginChannelOtpAddresses.address = address.channel == 'email' ? 
        SharedService.maskEmail(address.address) : 
        SharedService.maskString(address.address, '+', '4', '4');
      loginChannelOtpAddresses.enable = ConfigService.get('svcOtp.disableChannel').includes(address.channel) ? false : true;
      
      if(whiteListUserData && whiteListUserData.configChannel) {
        const configChannel = whiteListUserData.configChannel;
        loginChannelOtpAddresses.enable = configChannel[address.channel];
      }
      

      //Add sort mechanism
      if (sortChannel.includes(address.channel)) {
        for (var i = 0; i < sortChannel.length; i++) {
          if (sortChannel[i] == address.channel) {
            addresses[i] = loginChannelOtpAddresses;
            break;
          }
        }
      } else {
        addresses.push({ ...loginChannelOtpAddresses });
      }
    }
    return addresses;
  }

  private async generateToken(userId: number, clientId: string): Promise<string> {
    const text = `${userId}${moment().toDate()}`;
    const generateToken = crypto
      .createHash('md5')
      .update(text)
      .digest('hex');

    return generateToken;
  }

  private async isOtpRequired(clientId: string, userName: string): Promise<boolean> {
    if (ConfigService.get('svcOtp.bypassOTP').includes(userName)) {
      return false;
    }

    if (!ConfigService.get('svcOtp.checkingConfig')) { //if false, open otp to all users
      return true;
    }

    let whiteListUserData  = await RedisService.get(
      `pod:required:otp`,
      true,
    );

    let response;
    if (!whiteListUserData) {
      try {
        response = await axios.get(ConfigService.get('svcOtp.otpRequiredUrl'));
      } catch (err) {
        console.log('-----ERROR, when try to get user list----', err);
      }
    }

    if(response && response.data){
      whiteListUserData = response.data;
      console.log('whiteListUserData:::', whiteListUserData);
      await RedisService.setex(
        `pod:required:otp`,
        JSON.stringify(whiteListUserData),
        1800,
      );
    }

    /*
      Check "otpConfigCheck" key on s3config
      if value is "false", otp will open to all user 
      if value is "true", will check other config to determine user required otp or not
    */
    if (whiteListUserData && !whiteListUserData.otpConfigCheck) {
      return true;
    }

    let isRequired = false;
    if (whiteListUserData && ((clientId.toLowerCase() == 'web' && whiteListUserData.podweb)
      || (clientId.toLowerCase() == 'mobile' && whiteListUserData.podmobile))) {
        if (whiteListUserData.userlist.includes(userName)) {
          console.log('masuk:::::::::::');
          isRequired = true;
        }
    }

    return isRequired;
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
        message: 'User non aktif, OTP tidak dapat di kirim! Silahkan hubungi IT',
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

  private async getOtpCountDown(code: string, args:Array<any>){
    let message;
    if(null != args){
      const secondResp = parseInt(args[0]);
      let minutes = (Math.floor(secondResp / 60)).toString();
      let seconds = (Math.floor(secondResp - (parseInt(minutes) * 60))).toString();
      if (parseInt(minutes) < 10) { minutes = "0" + minutes; }
      if (parseInt(seconds) < 10) { seconds = "0" + seconds; }

      if (code == MESSAGE_ERROR_OTP.COUNTDOWN_ATTEMPT_CODE) {
        message = `Sudah melakukan request sebanyak ${Number(args[args.length-1])}x. Mohon tunggu ${minutes}menit ${seconds}detik lagi`;
        return { status: true, message: message };
      }

      if (code == MESSAGE_ERROR_OTP.COUNTDOWN_CODE) {
        message = `Mohon tunggu ${minutes}menit ${seconds}detik lagi`;
        return { status: true, message: message };
      }
    }

    return { status: false, message: message };
  }

  private async isDeactivatedUser(code: string, args: Array<any>){
    let message;
    if (code == MESSAGE_ERROR_OTP.DEACTIVATED_CODE){
      message = 'User ini tidak aktif, mohon hubungi admin.';
      return { status: true, message: message}
    }

    if (code == MESSAGE_ERROR_OTP.DEACTIVATED_ATTEMPT_CODE){
      if(null != args){
        message = `User ini tidak aktif karena sudah melakukan request sebanyak ${args[0]}x, mohon hubungi admin.`
        return { status: true, message: message }
      }
    }

    return { status: false, message: message }
  }

  private async isInvalidCode(code: string): Promise<boolean> {
    if (code == MESSAGE_ERROR_OTP.INVALID_CODE) {
      return true;
    }
    return false;
  }

  private async messageErrorAuthOtp(data: any): Promise<string>{
    // const message = data.message ? data.message : null;
    const code = data.code;
    const args = data.args ? data.args : null;

    const deactivatedUser = await this.isDeactivatedUser(code, args);
    if (deactivatedUser.status){
      return deactivatedUser.message;
    }

    const countDown = await this.getOtpCountDown(code, args);
    if (countDown.status) {
        return countDown.message;
    }

    if(await this.isInvalidCode(code)){
      return 'Kode OTP Salah';
    }

    return 'Terjadi kesalahan, Mohon hubungi admin.';
  }
}

