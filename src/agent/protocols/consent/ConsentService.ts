import { ConsentInvitationMessage } from './ConsentInvitationMessage';
import store from 'src/app/store';
import { NotificationItem, addNotification, NotificationState } from 'src/navigation/notifications/notificationsSlice'
import { classToPlain } from 'class-transformer';
import logger from 'aries-framework-javascript/build/lib/logger';

export class ConsentService {
  async acceptConsentInvitation(consentInvitation: ConsentInvitationMessage) {
    const serialized = classToPlain(consentInvitation);
    const item: NotificationItem<{}> = {
      title: 'Consent Invitation',
      description: 'An invitation to participate in a study',
      id: consentInvitation.id,
      state: NotificationState.INVITED,
      payload: serialized,
    }
    store.dispatch(addNotification(item));
  }

  /*

  challengeRequest(connection: Connection, message: Message) {
    const req = createConsentChallengeRequest();
    const outboundMessage = createOutboundMessage(connection, req);
    // TODO: CHANGE THIS TO RESOLVE PK FROM SOVRIN
    outboundMessage.recipientKeys = ['Hs6eiUnGncbcNPiKrakDvTEWW1prRjQ4635QtcK3vt8x']
    if (connection.theirDid) {
      this.nonceMap[connection.theirDid] = req.nonce;
      const { publicDid, documentDarc, orgName, studyName } = message;
      this.dataMap[connection.theirDid] = { orgName, studyName, publicDid, documentDarc };
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
  */
}