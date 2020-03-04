import uuid from 'uuid/v4';

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