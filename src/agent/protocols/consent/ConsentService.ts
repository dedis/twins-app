import { createConsentChallengeRequest } from './messages';
import { createOutboundMessage } from 'aries-framework-javascript/build/lib/protocols/helpers';
import { Connection } from 'aries-framework-javascript';
import { Message } from 'aries-framework-javascript/build/lib/types';

export class ConsentService {
  nonceMap: {[key: string]: string};
  dataMap: {[key: string]: {}};

  constructor() {
    this.nonceMap = {};
    this.dataMap = {};
  }

  challengeRequest(connection: Connection, message: Message) {
    const req = createConsentChallengeRequest();
    const outboundMessage = createOutboundMessage(connection, req);
    // TODO: CHANGE THIS TO RESOLVE PK FROM SOVRIN
    outboundMessage.recipientKeys = ['Hs6eiUnGncbcNPiKrakDvTEWW1prRjQ4635QtcK3vt8x']
    if (connection.theirDid) {
      this.nonceMap[connection.theirDid] = req.nonce;
      const { comment, publicDid, documentDarc } = message;
      this.dataMap[connection.theirDid] = { comment, publicDid, documentDarc };
    }
    return outboundMessage;
  }

  verifyChallengeResponse(connection: Connection, nonce: string) {
    if (!connection.theirDid) {
      return false;
    }
    if (this.nonceMap[connection.theirDid] === nonce) {
      delete this.nonceMap[connection.theirDid]
      return true;
    }
    return false;
  }

  getDataForRequest(connection: Connection) {
    if (!(connection.theirDid && connection.theirDid in this.dataMap)) {
      return {};
    }
    return this.dataMap[connection.theirDid];
  }
}