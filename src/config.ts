import { ConsentService } from './agent/protocols/consent/ConsentService';

// ### Insert mediator URL here ###
export const mediatorURL = 'https://mediator.twins-project.org';
// ### Insert your Byzcoin ID here ###
export const bcID = 'e14b0af583d5c23c46c0744f332f7d46d20221bf17370180860b3fb08c67397a';
// ### Insert your Ed25519 Signer private key here ###
// ### find it with: bcadmin key --print key-ed25519:XXX.cfg
export const signerPrivateKey = 'XXX'

export const consentService = new ConsentService();
