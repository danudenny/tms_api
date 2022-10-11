import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BaseEntity } from 'typeorm';
import { v1 as uuidv1 } from 'uuid';
import { JwtPermissionTokenPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../../../../shared/models/auth-login-metadata.model';

import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  CHECK_AWB_SERVICE,
  CheckAwbService,
} from '../../interfaces/check-awb.interface';
import { SORTATION_SERVICE } from '../../interfaces/sortation-service.interface';
import { MockSortationService } from '../mocks/sortation-service';
import { DefaultCheckAwbService } from './check-awb.service';

describe('DefaultCheckAwbService', () => {
  let service: DefaultCheckAwbService;
  const mockPermission = { branchId: 1 };
  const mockAuthData = { userId: 1 };

  beforeAll(async done => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: SORTATION_SERVICE, useClass: MockSortationService },
        DefaultCheckAwbService,
      ],
    }).compile();
    service = module.get<DefaultCheckAwbService>(DefaultCheckAwbService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AwbCheckSummary, 'create').mockReturnValue(null);
    jest
      .spyOn(AuthService, 'getPermissionTokenPayload')
      .mockReturnValue(mockPermission as JwtPermissionTokenPayload);
    jest
      .spyOn(AuthService, 'getAuthMetadata')
      .mockReturnValue(mockAuthData as AuthLoginMetadata);
  });

  describe('startSession', () => {
    it('should create a new awb_check_summary', async () => {
      const uuid = uuidv1();
      jest
        .spyOn(AwbCheckSummary, 'save')
        .mockReturnValue(
          Promise.resolve(({ id: uuid } as unknown) as BaseEntity),
        );
      const result = await service.startSession();
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.data.awbCheckId).toBe(uuid);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest.spyOn(AwbCheckSummary, 'save').mockImplementation(async () => {
        throw new InternalServerErrorException(errMsg);
      });
      try {
        const result = await service.startSession();
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });
  });
});
