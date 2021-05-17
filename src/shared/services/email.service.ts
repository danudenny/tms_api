import * as SendgridMail from '@sendgrid/mail';

export interface SendgridAttachmentInterface {
  content: any;
  filename: string;
  type: string;
  disposition: string;
}

export interface SendgridInterface {
  to: string | string[];
  cc?: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: SendgridAttachmentInterface[];
}

export class SendgrindMailResponseVm {
  statusCode: number;
  message: string;
}

export class EmailService {
  public static async sendEmail(message: SendgridInterface): Promise<SendgrindMailResponseVm> {
    const msg: any = message;

    await SendgridMail.setApiKey('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');
    try {
      const sendgrid: any = await SendgridMail.send(msg, false, (err, result) => {
        if (err) {
          throw err;
        }

        const response = new SendgrindMailResponseVm();
        response.statusCode = result[0].statusCode;
        return response;
      });

      const res = new SendgrindMailResponseVm();
      res.statusCode = sendgrid.statusCode;
      return res;
    } catch (error) {
      console.log(error);
      const res = new SendgrindMailResponseVm();
      res.statusCode = error.code;
      res.message = error.response.body;
      return res;
    }
  }
}
