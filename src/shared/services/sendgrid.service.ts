import { ConfigService } from './config.service';

export class SendgridService {

  public static async testSendEmail() {
    console.log('######### Mail with SendGrid ===========================');

    const msg = {
      to: 'degosdeas@gmail.com',
      from: 'degosdeas@gmail.com',
      subject: 'Sending with SendGrid is Fun and more',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<p>and easy to do anywhere, even with Node.js</p>',
    };
    this.sendMail(msg);
  }

  public static async sendMailPodProblem(
    mailto: string,
    dynamicTemplateData: any,
    ) {
    // NOTE: this template for email pod problem notification
    // templateId: 'd-a9ff5f3013d345a3903f1fd43a6ad74f',
    // sample data:
    // {
    //   subject: 'Testing Templates',
    //   name: 'Adry',
    //   city: 'Bandung',
    // },
    const msg = {
      to: mailto,
      from: 'admin-pod@sicepat.com',
      templateId: 'd-a9ff5f3013d345a3903f1fd43a6ad74f',
      dynamicTemplateData,
    };

    console.log(msg);
    this.sendMail(msg);
  }

  // general purpose
  public static async sendMail(message: any) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(ConfigService.get('sendgrid.apiKey'));

    sgMail.send(message).then(() => {
      // Celebrate
      console.log('######### Celebrate Send Email !!');
    });
  }
}
