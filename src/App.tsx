global.Buffer = global.Buffer || require('buffer').Buffer;
import React from 'react';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {mapping, dark as darkTheme} from '@eva-design/eva';
import {AppNavigator} from './navigation/navigation.component';
import {default as appTheme} from './custom-theme.json';
import {
  RealTimeInboundTransporter,
  HTTPOutboundTransporter,
} from '../transporters';
import {InitConfig} from 'aries-framework-javascript/build/lib/types';
import {Agent} from 'aries-framework-javascript';
import RNFS from 'react-native-fs';
// @ts-ignore
import indy from 'rn-indy-sdk';
import debug from 'debug';
import { ConsentRequestHandler } from './agent/handlers/consent/ConsentRequestHandler';
import { ConsentService } from './agent/protocols/consent/ConsentService';
import { MessageType as ConsentMessageType } from './agent/protocols/consent/messages';
import { ConsentChallengeResponseHandler } from './agent/handlers/consent/ConsentChallengeResponseHandler';

// ### Insert mediator URL here ###
export const mediatorURL = 'http://b081c174.ngrok.io';
// ### Insert your Byzcoin ID here ###
export const bcID = '310ccffa343718ae4a29164bb74e8b8dee59fae302a3b5a131ff37bee8ca6224';

debug.enable('aries-framework-javascript');
const theme = {...darkTheme, ...appTheme};

export const consentService = new ConsentService();

const App = () => {
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

  agent.handlers[ConsentMessageType.ConsentRequest] = new ConsentRequestHandler(consentService, agent.connectionService);
  agent.handlers[ConsentMessageType.ConsentChallengeResponse] = new ConsentChallengeResponseHandler();

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <AppNavigator screenProps={{agent}} />
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;

