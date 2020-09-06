import { ConsentChallengeResponse } from '../../protocols/consent/messages';
import { Handler, HandlerInboundMessage } from 'aries-framework-javascript/build/lib/handlers/Handler';

export class ConsentChallengeResponseHandler {
  public supportedMessages = [ConsentChallengeResponse]
  async handle(inboundMessage: HandlerInboundMessage<ConsentChallengeResponseHandler>) {
    return
  }
}