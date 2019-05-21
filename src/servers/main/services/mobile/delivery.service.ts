import { HttpStatus, Injectable, Logger, Query } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from 'src/shared/services/auth.service';
import { GetRoleResult } from 'src/shared/models/get-role-result';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';
import { MetaService } from 'src/shared/services/meta.service';
import moment = require('moment');
import { Awb } from 'src/shared/orm-entity/awb';

@Injectable()
export class MobileDeliveryService {
  constructor() // @InjectRepository(LoginSessionRepository)
  // private readonly loginSessionRepository: LoginSessionRepository,
  {}

  async downloadWorkOrder(): Promise<any> {
    const limit = 10;
    const yesterday = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      'select * from branch where created_time > :yesterday limit :limit',
      { limit, yesterday },
    );

    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    return data;
  }

  async permissionRoles(): Promise<GetRoleResult> {
    const authMeta = AuthService.getAuthMetadata();
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {
      // Populate return value
      const result = new GetRoleResult();
      result.userId = authMeta.userId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;

      return result;
    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllMobileDelivery(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await Awb.findAndCount({
      // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
      cache: true,
      take,
      skip,
    });
    const result = new MobileDeliveryFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);

    return result;
  }
}
