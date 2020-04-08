import {ConsentService} from './agent/protocols/consent/ConsentService';

// ### Insert mediator URL here ###
export const mediatorURL = 'http://38851d89.ngrok.io';
// ### Insert your Byzcoin ID here ###
export const bcID =
  '310ccffa343718ae4a29164bb74e8b8dee59fae302a3b5a131ff37bee8ca6224';

// ### Insert your Ed25519 Signer Secret here ###
export const signerID =
  'ca24611e1fcbd5c811fd4607d2130dfab037fca0b4b49d286aebe4ef612fe10c';

export const consentService = new ConsentService();
