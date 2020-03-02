import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { ConsentService } from '../../protocols/consent/ConsentService';
import { ConnectionService } from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionService';

export class ConsentRequestHandler {
  consentService: ConsentService;
  connectionService: ConnectionService;

  constructor(consentService: ConsentService, connectionService: ConnectionService) {
    this.consentService = consentService;
    this.connectionService = connectionService;
  }

  async handle(inboundMessage: InboundMessage) {
    const connection = this.connectionService.findByVerkey(inboundMessage.recipient_verkey);
    if (!connection) {
      throw new Error(`Connection for recipient_verkey ${inboundMessage.recipient_verkey} does not exist`)
    }
    return this.consentService.challengeRequest(connection, inboundMessage.message);
  }
}