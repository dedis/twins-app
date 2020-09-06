import uuid from 'uuid/v4';
import { Equals, IsString } from 'class-validator';
import { AgentMessage } from 'aries-framework-javascript/build/lib/agent/AgentMessage';

export enum MessageType {
  ConsentRequest = 'https://dedis.epfl.ch/consent/1.0/consent-request',
  ConsentChallengeRequest = 'https://dedis.epfl.ch/consent/1.0/consent-challenge-request',
  ConsentChallengeResponse = 'https://dedis.epfl.ch/consent/1.0/consent-challenge-response',
  ConsentResponse = 'https://dedis.epfl.ch/consent/1.0/consent-response'
}

export enum ConsentStatus {
  UNDECIDED,
  DENIED,
  GRANTED,
  REVOKED,
}

export function createConsentChallengeRequest() {
  return {
    '@id': uuid(),
    '@type': MessageType.ConsentChallengeRequest,
    nonce: uuid(),
  }
}

export function createConsentResponse(documentDarc: string, status: ConsentStatus) {
  return {
    '@id': uuid(),
    '@type': MessageType.ConsentResponse,
    documentDarc,
    status,
  }
}

export class ConsentRequestMessage extends AgentMessage {
  public constructor(options: { nonce: string }) {
    super();
    this.nonce = options.nonce;
  }

  public readonly type = ConsentRequestMessage.type;
  public static readonly type = MessageType.ConsentRequest;

  @IsString()
  public nonce: string
}

export class ConsentChallengeResponse extends AgentMessage {
  public constructor() {
    super();
  }

  public readonly type = ConsentChallengeResponse.type;
  public static readonly type = MessageType.ConsentChallengeResponse;
}