export enum MessageType {
  InvitationMessage = 'https://dedis.epfl.ch/consent/1.0/information/invite',
  RequestMessage = 'https://dedis.epfl.ch/consent/1.0/information/request',
  ResponseMessage = 'https://dedis.epfl.ch/consent/1.0/information/response',
  ResponseFailureMessage = 'https://dedis.epfl.ch/consent/1.0/information/failure',
  ConsentGrantMessage = 'https://dedis.epfl.ch/consent/1.0/consent/grant',
  ConsentDenyMessage = 'https://dedis.epfl.ch/consent/1.0/consent/deny',
  DecryptionSuccess = 'https://dedis.epfl.ch/consent/1.0/decryption/success',
  DecryptionFailure = 'https://dedis.epfl.ch/consent/1.0/decryption/failure',
}