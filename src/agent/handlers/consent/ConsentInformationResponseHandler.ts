import {
  Handler,
  HandlerInboundMessage,
} from 'aries-framework-javascript/build/lib/handlers/Handler';
import {ConsentInvitationMessage} from 'src/agent/protocols/consent/ConsentInvitationMessage';
import {ConsentService} from 'src/agent/protocols/consent/ConsentService';
import {ConsentInformationResponseMessage} from 'src/agent/protocols/consent/ConsentInformationResponseMessage';

export class ConsentInformationResponseHandler implements Handler {
  public supportedMessages = [ConsentInformationResponseMessage];
  private consentService: ConsentService;

  public constructor(consentService: ConsentService) {
    this.consentService = consentService;
  }

  public async handle(
    inboundMessage: HandlerInboundMessage<ConsentInformationResponseHandler>,
  ) {
    await this.consentService.receiveConsentInformation(inboundMessage);
  }
}
