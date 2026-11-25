import type { MailPort } from './protocol';

export const unavailableMail: MailPort = {
  canSend() {
    return Promise.resolve(false);
  },
  sendProof() {
    return Promise.resolve('rejected');
  },
};
