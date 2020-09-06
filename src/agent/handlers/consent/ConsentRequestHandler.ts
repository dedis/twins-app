import { ConsentService } from '../../protocols/consent/ConsentService';
import { ConnectionService } from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionService';
import { ConsentRequestMessage } from '../../protocols/consent/messages';
import { HandlerInboundMessage } from 'aries-framework-javascript/build/lib/handlers/Handler';

export class ConsentRequestHandler {
  consentService: ConsentService;
  connectionService: ConnectionService;
  public supportedMessages = [ConsentRequestMessage];

  constructor(consentService: ConsentService, connectionService: ConnectionService) {
    this.consentService = consentService;
    this.connectionService = connectionService;
  }

  async handle(inboundMessage: HandlerInboundMessage<ConsentRequestHandler>) {
    const connection = this.connectionService.findByVerkey(inboundMessage.recipientVerkey!);
    if (!connection) {
      throw new Error(`Connection for recipient_verkey ${inboundMessage.recipientVerkey!} does not exist`)
    }
    return this.consentService.challengeRequest(connection, inboundMessage.message);
  }
}