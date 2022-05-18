import axios from 'axios';
import { ConfigService } from '../../shared/services/config.service';

export class SlackUtil {
  public static get slackURL() {
    return ConfigService.get('slack.baseUrl');
  }

  public static get slackUserName() {
    return ConfigService.get('slack.userSlack');
  }

  public static get tokenSlack() {
    return ConfigService.get('slack.tokenSlack');
  }

  public static async sendMessage(
    channel: string,
    text: string,
    stack?: string,
    fields?: any,
    icon?: string,
    username?:string,
  ) {
    let url = `${this.slackURL}/${this.tokenSlack}`;
    text = `[${process.env.NODE_ENV}] : ${text}`;
    const options = {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (stack) {
      stack = '```' + stack + '```';
    }

    let fieldObj: string;
    if (fields) {
      fieldObj = JSON.stringify(fields);
      fieldObj = '```' + fieldObj + '```';
    }

    const body = {
      username: username || this.slackUserName,
      channel: channel,
      text: text,
      icon_emoji: (icon) ? icon : ':sicepat:', 
      attachments: [
        {
          text: stack,
          color: '#e50606',
          title: 'Stack Trace',
          mrkdwn_in: ['text'],
        },
        {
          text: fieldObj,
          color: '#4AD41D',
          title: 'Fields',
          mrkdwn_in: ['text'],
        },
      ],
    };

    try {
      let sendMessage = await axios.post(url, body, options);
      return sendMessage;
    } catch (err) {
      console.log('error at slack service sending message : ', err.message);
    }
  }
}
