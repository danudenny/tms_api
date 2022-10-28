import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BaseEntity } from 'typeorm';
import { v1 as uuidv1 } from 'uuid';

import { JwtPermissionTokenPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../../../../shared/models/auth-login-metadata.model';
import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { HubCheckAwbQueueService } from '../../../queue/services/hub-check-awb-queue.service';
import { CHECK_AWB_SERVICE } from '../../interfaces/check-awb.interface';
import {
  SortationMachineService,
  SORTATION_MACHINE_SERVICE,
} from '../../interfaces/sortation-machine-service.interface';
import { MockSortationMachineService } from '../mocks/sortation-machine.service';
import { DefaultCheckAwbService } from './check-awb.service';

describe('DefaultCheckAwbService', () => {
  let service: DefaultCheckAwbService;
  let sortationService: SortationMachineService;
  const mockPermission = { branchId: 1 };
  const mockAuthData = { userId: 1 };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: SORTATION_MACHINE_SERVICE,
          useClass: MockSortationMachineService,
        },
        { provide: CHECK_AWB_SERVICE, useClass: DefaultCheckAwbService },
      ],
    }).compile();
    service = module.get<DefaultCheckAwbService>(CHECK_AWB_SERVICE);
    sortationService = module.get<SortationMachineService>(
      SORTATION_MACHINE_SERVICE,
    );
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
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.data.awbCheckId).toBe(uuid);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest.spyOn(AwbCheckSummary, 'save').mockImplementation(async () => {
        throw new InternalServerErrorException(errMsg);
      });
      try {
        await service.startSession();
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });
  });

  describe('getAwb', () => {
    const getMockDuplicateQuery = val => ({
      andWhereRaw: () => val,
    });
    const getMockQueryBuilder = val =>
      ({
        select: () => getMockQueryBuilder(val),
        innerJoinRaw: () => getMockQueryBuilder(val),
        andWhereRaw: () => getMockDuplicateQuery(val),
      } as any);
    const payload = {
      awbCheckId: uuidv1(),
      awbNumber: '0000000000',
    };
    const expected = {
      awbCheckId: payload.awbCheckId,
      awbNumber: payload.awbNumber,
      destination: 'Tangerang Kadu Agung',
      transportType: 'SMU',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(HubCheckAwbQueueService, 'addJob')
        .mockReturnValue(Promise.resolve(true));
      jest
        .spyOn(AwbCheckSummary, 'save')
        .mockReturnValue(
          Promise.resolve(({ id: uuidv1() } as unknown) as BaseEntity),
        );
    });

    it('should return awb info immediately', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder({}));
      const response = await service.getAwb(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(expected);
    });

    it('should throw internal server exception - sortation service throws error', async () => {
      const errMsg = 'Unexpected service error';
      jest
        .spyOn(sortationService, 'checkAwb')
        .mockImplementationOnce(async () => {
          throw new InternalServerErrorException(errMsg);
        });
      try {
        await service.getAwb(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

    it('should throw internal server exception - unexpected database error', async () => {
      const errMsg = 'Unexpected database error';
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(null));
      jest.spyOn(AwbCheckSummary, 'findOne').mockImplementation(() => {
        throw new InternalServerErrorException(errMsg);
      });
      try {
        await service.getAwb(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

    it('should create new session - current session not found', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(null));
      jest
        .spyOn(AwbCheckSummary, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      const response = await service.getAwb(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data.awbCheckId).not.toEqual(expected.awbCheckId);
    });

    it('should create new session - max idle time exceeded', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(null));
      jest.spyOn(AwbCheckSummary, 'findOne').mockReturnValue(
        Promise.resolve(({
          endTime: new Date('2000-01-01'),
        } as unknown) as BaseEntity),
      );

      const response = await service.getAwb(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data.awbCheckId).not.toEqual(expected.awbCheckId);
    });

    it('should return awb information after adding job', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(null));
      jest.spyOn(AwbCheckSummary, 'findOne').mockReturnValue(
        Promise.resolve(({
          endTime: new Date(),
        } as unknown) as BaseEntity),
      );

      const response = await service.getAwb(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(expected);
    });
  });
});
