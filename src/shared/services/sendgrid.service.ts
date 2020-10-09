import { ConfigService } from './config.service';

export class SendgridService {

  // NOTE: https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
  public static async sendMailDynamicTemplateData(
    from: string,
    templateId: string,
    personalizations: any,
    dynamicTemplateData: any,
    ) {

    const msg = {
      personalizations,
      from,
      templateId,
      dynamicTemplateData,
    };

    this.sendMail(msg);
  }

  // general purpose
  public static async sendMail(message: any) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(ConfigService.get('sendgrid.apiKey'));

    sgMail.send(message).then(() => {
      console.log('email sent successfully!');
    });
  }

  public static async sendMultiple(message: any) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(ConfigService.get('sendgrid.apiKey'));

    sgMail
      .sendMultiple(message)
      .then(() => {
        console.log('emails sent multiple successfully!');
      })
      .catch(error => {
        console.error(error);
      });
  }
}
