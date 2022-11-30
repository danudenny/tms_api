import { CanActivate, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CheckAwbListController } from '../../controllers/awb/check-awb-list.controller';
import { BagListController } from '../../controllers/bag/bag-list.controller';
import { HUB_BAG_LIST_SERVICE } from '../../interfaces/bag-list.interface';
import { CheckBagDetailResponVm, CheckBagGpListResponVm } from '../../models/bag/hub-bag-list.respone';
import { DefaultBagListService } from './bag-list.service';

describe('CheckBagListService', () => {

 let defaultBagListService: DefaultBagListService;

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
        controllers : [BagListController],
        providers : [  { provide: HUB_BAG_LIST_SERVICE, useClass: DefaultBagListService }],
    })
        .overrideGuard(AuthenticatedGuard).useValue(mockGuard)
        .overrideGuard(PermissionTokenGuard).useValue(mockGuard)
        .compile();

    defaultBagListService = module.get<DefaultBagListService>
    (HUB_BAG_LIST_SERVICE);

  });

 const payload = new BaseMetaPayloadVm();

 describe('Get list Bag awb', () => {

    it('should create a List Check AWB ', async () => {

      const listData =  new CheckBagGpListResponVm();
      listData.statusCode = HttpStatus.OK;
      listData.data = [
        {
          bagId : '63624baeb22cc1081adec264',
          bagNumber: 'XE3249903',
          createdTime: '2022-10-12T06:15:00.000Z',
          branchFromName: 'Kantor Pusat 1',
          representativeCode: 'HO',
          transportMode: 'SMU',
          totalResi: 0,
          weight: '1 KG',

        }];

      jest
        .spyOn(defaultBagListService, 'listBag')
        .mockImplementation(async () => listData);

      const response = await defaultBagListService.listBag(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(listData.data);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest
        .spyOn(defaultBagListService, 'listBag')
        .mockImplementation(async () =>  { throw new InternalServerErrorException(errMsg); });

      try {
        await defaultBagListService.listBag(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

  });

 describe('Get detail check gabung paket', () => {
    it('should create a detail Check AWB ', async () => {

      const detailData =  new CheckBagDetailResponVm();
      detailData.statusCode = HttpStatus.OK;
      detailData.data = [
        {
        awbNumber: '066600001722',
        consigneeName: 'Sigesit',
        consigneeAddress: 'Jl. Tegar Beriman kel. Jabon Kec. Kemang Kota Bogor (ga mau jadi kabupaten)',
        branchToName: 'Serpong',
      },
      ];

      jest
        .spyOn(defaultBagListService, 'detailBag')
        .mockImplementation(async () => detailData);

      const response = await defaultBagListService.detailBag(payload);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.data).toEqual(detailData.data);
    });

    it('should throw an internal server exception', async () => {
      const errMsg = 'Unexpected database error';
      jest
        .spyOn(defaultBagListService, 'detailBag')
        .mockImplementation(async () =>  { throw new InternalServerErrorException(errMsg); });

      try {
        await defaultBagListService.detailBag(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

  });

});
