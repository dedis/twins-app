import {
  Handler,
  HandlerInboundMessage,
} from '@gnarula/aries-framework-javascript/build/lib/handlers/Handler';
import {ConsentInvitationMessage} from 'src/agent/protocols/consent/ConsentInvitationMessage';
import {ConsentService} from 'src/agent/protocols/consent/ConsentService';

export class ConsentInvitationHandler implements Handler {
  public supportedMessages = [ConsentInvitationMessage];
  private consentService: ConsentService;

  public constructor(consentService: ConsentService) {
    this.consentService = consentService;
  }

  public async handle(
    inboundMessage: HandlerInboundMessage<ConsentInvitationHandler>,
  ) {
    await this.consentService.receiveConsentInvitation(inboundMessage.message);
  }
}
