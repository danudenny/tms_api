

// static async scanOutAwbDeliver(
//   payload: WebScanOutAwbVm,
// ): Promise<WebScanOutAwbResponseVm> {
//   const authMeta = AuthService.getAuthData();
//   const permissonPayload = AuthService.getPermissionTokenPayload();

//   const dataItem = [];
//   const result = new WebScanOutAwbResponseVm();

//   let totalSuccess = 0;
//   let totalError = 0;
//   let employeeIdDriver = 0; // partner does not have employee id
//   let employeeNameDriver = null;
//   // const statusFinal = [AWB_STATUS.DLV, AWB_STATUS.CANCEL_DLV];

//   // find data doPod Deliver
//   const doPodDeliver = await DoPodDeliverRepository.byIdCache(payload.doPodId);
//   if (!doPodDeliver) {
//     throw new BadRequestException('Surat Jalan tidak valid!');
//   }

//   if (doPodDeliver && doPodDeliver.userIdDriver) {
//     // find by user driver
//     const userDriver = await User.findOne({
//       userId: doPodDeliver.userIdDriver,
//       isDeleted: false,
//     }, { cache: true });
//     if (userDriver) {
//       employeeIdDriver = userDriver.employeeId;
//       employeeNameDriver =  userDriver.firstName;
//     }
//   }

//   for (const awbNumber of payload.awbNumber) {
//     const response = new ScanAwbVm();
//     // let notDeliver = true;
//     // let isValid = true;

//     response.status = 'ok';
//     response.message = 'success';

//     const awb = await AwbService.validAwbNumber(awbNumber);
//     if (awb) {
//       // // #region check validation
//       // // handle if awb status is null
//       // if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
//       //   notDeliver = awb.awbStatusIdLast != AWB_STATUS.ANT ? true : false;
//       // }

//       // if (statusFinal.includes(awb.awbStatusIdLast)) {
//       //   isValid = false;
//       //   totalError += 1;
//       //   response.status = 'error';
//       //   // handle message
//       //   const desc =
//       //     awb.awbStatusIdLast == AWB_STATUS.CANCEL_DLV
//       //       ? 'telah di CANCEL oleh Partner !'
//       //       : 'sudah Final Status !';
//       //   response.message = `Resi ${awbNumber} ${desc}`;
//       // }

//       // // NOTE: check resi cancel delivery
//       // const isCancel = await AwbService.isCancelDelivery(awb.awbItemId);
//       // if (isCancel == true) {
//       //   isValid = false;
//       //   totalError += 1;
//       //   response.status = 'error';
//       //   response.message = `Resi ${awbNumber} telah di CANCEL oleh Partner !`;
//       // }
//       // #endregion validation

//       const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, false, false);
//       if (checkValidAwbStatusIdLast.isValid) {
//         // Add Locking setnx redis
//         const holdRedis = await RedisService.lockingWithExpire(
//           `hold:scanoutant:${awb.awbItemId}`,
//           'locking',
//           60,
//         );
//         if (holdRedis) {
//           // #region after scanout
//           // save table do_pod_detail
//           // NOTE: check data double DoPodDeliverDetail by awb item id
//           // if found update flag is deleted true;
//           try {

//             await getManager().transaction(async transactionManager => {
//               // flag delete data if exist, handle double awb on spk
//               const dataSpk = await DoPodDeliverDetail.find({
//                 select: ['awbNumber'],
//                 where: {
//                   awbItemId: awb.awbItemId,
//                   isDeleted: false,
//                 },
//               });
//               if (dataSpk.length) {
//                 await transactionManager.update(
//                   DoPodDeliverDetail,
//                   {
//                     awbItemId: awb.awbItemId,
//                     isDeleted: false,
//                   },
//                   {
//                     isDeleted: true,
//                     userIdUpdated: authMeta.userId,
//                   },
//                 );
//               }

//               const doPodDeliverDetail = DoPodDeliverDetail.create();
//               doPodDeliverDetail.doPodDeliverId = payload.doPodId;
//               doPodDeliverDetail.awbId = awb.awbId;
//               doPodDeliverDetail.awbItemId = awb.awbItemId;
//               doPodDeliverDetail.awbNumber = awbNumber;
//               doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
//               await transactionManager.insert(DoPodDeliverDetail,
//                 doPodDeliverDetail,
//               );

//               // NOTE: queue by Bull ANT
//               DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
//                 awb.awbItemId,
//                 AWB_STATUS.ANT,
//                 permissonPayload.branchId,
//                 authMeta.userId,
//                 employeeIdDriver,
//                 employeeNameDriver,
//               );

//               totalSuccess += 1;
//               // handle print metadata - Scan Out & Deliver
//               response.printDoPodDetailMetadata = this.handlePrintMetadata(awb);

//             });
//           } catch (e) {
//             totalError += 1;
//             response.status = 'error';
//             response.message = `Gangguan Server: ${e.message}`;
//           }

//           // #endregion after scanout
//           // remove key holdRedis
//           RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
//         } else {
//           totalError += 1;
//           response.status = 'error';
//           response.message = `Server Busy: Resi ${awbNumber} sedang di proses.`;
//         }
//       } else {
//         totalError += 1;
//         response.status = 'error';
//         response.message = checkValidAwbStatusIdLast.message;
//       }
//     } else {
//       totalError += 1;
//       response.status = 'error';
//       response.message = `Resi ${awbNumber} Tidak di Temukan`;
//     }

//     // push item
//     dataItem.push({
//       awbNumber,
//       ...response,
//     });
//   } // end of loop

//   // NOTE: counter total scan out
//   if (doPodDeliver && totalSuccess > 0) {
//     const totalAwb = doPodDeliver.totalAwb + totalSuccess;
//     await DoPodDeliver.update(
//       {
//         doPodDeliverId: doPodDeliver.doPodDeliverId,
//       },
//       {
//         totalAwb,
//       },
//     );
//     // RedisService.del(
//     //   `hold:doPodDeliverId:${doPodDeliver.doPodDeliverId}`,
//     // );
//   }

//   // Populate return value
//   result.totalData = payload.awbNumber.length;
//   result.totalSuccess = totalSuccess;
//   result.totalError = totalError;
//   result.data = dataItem;

//   return result;
// }