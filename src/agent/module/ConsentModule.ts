import {ConsentService} from '../protocols/consent/ConsentService';
import {ConsentInvitationMessage} from '../protocols/consent/ConsentInvitationMessage';
import {MessageSender} from 'aries-framework-javascript/build/lib/agent/MessageSender';

export class ConsentModule {
  private consentService: ConsentService;
  private messageSender: MessageSender;

  constructor(consentService: ConsentService, messageSender: MessageSender) {
    this.consentService = consentService;
    this.messageSender = messageSender;
  }

  async requestConsentInformation(invitationId: string) {
    const req = await this.consentService.requestConsentInformation(
      invitationId,
    );
    return await this.messageSender.sendMessage(req);
  }

  async denyInvite(invitationId: string) {
    return this.consentService.denyInvite(invitationId);
  }

  async grantConsent(invitationId: string) {
    const req = await this.consentService.grantConsent(invitationId);
    return await this.messageSender.sendMessage(req);
  }
}
