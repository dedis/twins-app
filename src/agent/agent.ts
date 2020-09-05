import RNFS from 'react-native-fs';
import debug from 'debug';
// @ts-ignore
import indy from 'rn-indy-sdk';

import { RealTimeInboundTransporter, HTTPOutboundTransporter } from "./transport/transporters";
import { InitConfig } from "aries-framework-javascript/build/lib/types";
import { mediatorURL } from "src/app/config";
import { Agent } from "aries-framework-javascript";
import { ConsentRequestHandler } from "./handlers/consent/ConsentRequestHandler";
import { ConsentChallengeResponseHandler } from "./handlers/consent/ConsentChallengeResponseHandler";
import { MessageType as ConsentMessageType } from './protocols/consent/messages';
import { ConsentService } from './protocols/consent/ConsentService';

debug.enable('aries-framework-javascript');

const inboundTransporter = new RealTimeInboundTransporter();
const outboundTransporter = new HTTPOutboundTransporter();

const config: InitConfig = {
  label: 'EdgeAgent',
  agencyUrl: mediatorURL,
  url: mediatorURL,
  port: 80,
  walletConfig: {
    id: 'EdgeWallet',
    storage_config: {
      path: RNFS.DocumentDirectoryPath + '/.indy_wallet',
    },
  },
  walletCredentials: {
    key: '1234',
  },
};
console.log('instantiated agent');
const agent = new Agent(
  config,
  inboundTransporter,
  outboundTransporter,
  indy,
);

const consentService = new ConsentService();

agent.handlers[ConsentMessageType.ConsentRequest] = new ConsentRequestHandler(consentService, agent.connectionService);
agent.handlers[ConsentMessageType.ConsentChallengeResponse] = new ConsentChallengeResponseHandler();

export default agent;
