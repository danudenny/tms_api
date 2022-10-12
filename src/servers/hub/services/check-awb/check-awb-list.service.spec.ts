import { CanActivate, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CheckAwbListController } from '../../controllers/awb/check-awb-list.controller';
import { CheckAwbDetailResponVm, CheckAwbListResponVm } from '../../models/check-awb/check-awb-list.response';
import { CheckAwbListService } from './check-awb-list.service';

describe('CheckAwbListService', () => {
  let checkAwbListController: CheckAwbListController;
  let checkAwbListService: CheckAwbListService;

  const getMockQueryBuilder = val =>
  ({
    selectRaw: () => getMockQueryBuilder(val),
    innerJoin: () => getMockQueryBuilder(val),
    andWhere: () => getMockQueryBuilder(val),
    take: () => getMockQueryBuilder(val),
    skip: () => getMockQueryBuilder(val),
    exec: () => getMockQueryBuilder(val),
    countWithoutTakeAndSkip: () => getMockQueryBuilder(val),
  } as any);

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
        controllers : [CheckAwbListController],
        providers : [CheckAwbListService],
    })
        .overrideGuard(AuthenticatedGuard).useValue(mockGuard)
        .overrideGuard(PermissionTokenGuard).useValue(mockGuard)
        .compile();

    checkAwbListController = module.get<CheckAwbListController>
    (CheckAwbListController);

    checkAwbListService = module.get<CheckAwbListService>
    (CheckAwbListService);

  });

  const payload = new BaseMetaPayloadVm();

  describe('Get list check awb', () => {

    it('should create a List Check AWB ', async () => {

      const listData =  new CheckAwbListResponVm();
      listData.statusCode = HttpStatus.OK;
      listData.data = [{
            awbCheckId: '09442eda-49d0-11ed-974b-77a6ad9c4cb7',
            startTime: '2022-10-12T01:48:59.159Z',
            endTime: '2022-10-12T01:55:22.895Z',
            branchId: 121,
            nik: '26966',
            name: 'Dev Middle',
            totalAwb: '4',
            branchName : 'Kantor Pusat 1',
        }];

      jest
        .spyOn(checkAwbListService, 'checkAwbList')
        .mockImplementation(async () => listData);

      const response = await checkAwbListService.checkAwbList(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(listData.data);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest
        .spyOn(checkAwbListService, 'checkAwbList')
        .mockImplementation(async () =>  { throw new InternalServerErrorException(errMsg); });

      try {
        await checkAwbListService.checkAwbList(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

  });

  describe('Get detail check awb', () => {
    it('should create a detail Check AWB ', async () => {

      const detailData =  new CheckAwbDetailResponVm();
      detailData.statusCode = HttpStatus.OK;
      detailData.data = [{
                        awbNumber: '00001111114',
                        consigneeName: null,
                        consigneeAddress: null,
                        districtName: null,
                      }];

      jest
        .spyOn(checkAwbListService, 'checkAwbDetail')
        .mockImplementation(async () => detailData);

      const response = await checkAwbListService.checkAwbDetail(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(detailData.data);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest
        .spyOn(checkAwbListService, 'checkAwbDetail')
        .mockImplementation(async () =>  { throw new InternalServerErrorException(errMsg); });

      try {
        await checkAwbListService.checkAwbDetail(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

  });

});

