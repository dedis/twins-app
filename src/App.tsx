global.Buffer = global.Buffer || require('buffer').Buffer;
import React from 'react';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import { mapping, dark } from '@eva-design/eva';
import {AppNavigator} from './navigation/navigation.component';
import { myTheme } from './custom-theme';
import {
  RealTimeInboundTransporter,
  HTTPOutboundTransporter,
} from '../transporters';
import { InitConfig } from 'aries-framework-javascript/build/lib/types';
import {Agent} from 'aries-framework-javascript';
import RNFS from 'react-native-fs';
// @ts-ignore
import indy from 'rn-indy-sdk';
import debug from 'debug';
import { ConsentRequestHandler } from './agent/handlers/consent/ConsentRequestHandler';
import { ConsentService } from './agent/protocols/consent/ConsentService';
import { ConsentChallengeResponseHandler } from './agent/handlers/consent/ConsentChallengeResponseHandler';
import { Connections } from './navigation/connections.component';
import { MessageType as ConsentMessageType } from './agent/protocols/consent/messages';
import { Notification } from './navigation/notification.component';
import { mediatorURL, consentService } from './config';

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
agent.handlers[ConsentMessageType.ConsentRequest] = new ConsentRequestHandler(consentService, agent.connectionService);
agent.handlers[ConsentMessageType.ConsentChallengeResponse] = new ConsentChallengeResponseHandler();


const App = () => {

  const [connectionState, setConnectionState] = React.useState<Connections[]>([]);
  const [notificationState, setNotificationState] = React.useState<Notification[]>([]);
  const [listenerState, setListenerState] = React.useState<boolean>(false);

  const theme = { ...dark, ...myTheme };

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <AppNavigator screenProps={{ agent, connectionState, setConnectionState, notificationState, setNotificationState, listenerState, setListenerState }} />
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;

