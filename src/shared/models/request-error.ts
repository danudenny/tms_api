export class RequestError extends Error {
  message: string | any = null;
  messageList: any[] = [];
  detail?: any;

  buildMessage() {
    if (!this.message) {
      if (this.messageList && this.messageList.length) {
        if (this.messageList.length === 1) {
          this.message = this.messageList[0];
        } else if (this.messageList.length > 0) {
          this.message = this.messageList.join('\n');
        } else {
          this.message = 'Terjadi kesalahan tidak terduga';
        }
      }
    }
  }
}
