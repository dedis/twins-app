import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { ConsentService } from '../../protocols/consent/ConsentService';
import { ConnectionService } from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionService';

export class ConsentChallengeResponseHandler {
  async handle(inboundMessage: InboundMessage) {
      return null;
  }
}