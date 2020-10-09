import { SendgridService } from '../../../../shared/services/sendgrid.service';
import { NotifEmailProblemVm } from '../../models/notification/email-problem.vm';

export class NotificationMailService {
  static async podProblem(
    recipient_email: string,
    message: NotifEmailProblemVm,
  ) {
    // #region this template for email pod problem notification
    // templateId: 'd-a9ff5f3013d345a3903f1fd43a6ad74f',
    // sample data:
    // {
    //   "subject": "[SiCepat] Informasi Paket 000782892220",
    //   "problem_status": "Antar Ulang",
    //   "awb_number": "000782892220",
    //   "customer": {
    //       "name": "Satria",
    //       "phone": "08123456789",
    //       "time_delivery": "09 Oktober 2020 10:00",
    //       "address": "Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 1012"
    //   }
    // }
    // #endregion

    // TODO: manipulation data
    // update subject email data
    const data = {
      subject: `📦 [SiCepat] Informasi Paket ${message.awb_number} 📦`,
      problem_status: message.problem_status,
      awb_number: message.awb_number,
      customer: message.customer,
    };
    const personalizations = [
      {
        to: 'adry@e.sicepat.com', // replace this with your admin email address
      },
    ];

    // recipient_email
    personalizations.push({
      to: recipient_email,
    });

    await SendgridService.sendMailDynamicTemplateData(
      'SiCepat Admin POD <admin-pod@sicepat.com>',
      'd-a9ff5f3013d345a3903f1fd43a6ad74f',
      personalizations,
      data,
    );
  }

  // TODO:
  static async podDelivery() {

  }
}
