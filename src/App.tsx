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

debug.enable('aries-framework-javascript');

const theme = {...darkTheme, ...appTheme};

export const consentService = new ConsentService();

const App = () => {
  const inboundTransporter = new RealTimeInboundTransporter();
  const outboundTransporter = new HTTPOutboundTransporter();

  const config: InitConfig = {
    label: 'EdgeAgent',
    agencyUrl: 'http://a53aa0d9.ngrok.io', // TODO: Replace with Mediator URL
    url: 'http://a53aa0d9.ngrok.io', // TODO: Replace with Mediator URL
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

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format

import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { Agent } from 'aries-framework-javascript';
import { RealTimeInboundTransporter, HTTPOutboundTransporter } from './transporters';
// @ts-ignore
import indy from 'rn-indy-sdk';
import { InitConfig } from 'aries-framework-javascript/build/lib/types';
import RNFS from 'react-native-fs';
// @ts-ignore
import QRCode from 'react-native-qrcode-svg';


export default class EdgeAgentApp extends Component {
  agent: Agent;

  constructor(props: Readonly<{}>) {
    super(props);
    const inboundTransporter = new RealTimeInboundTransporter();
    const outboundTransporter = new HTTPOutboundTransporter();

    const config: InitConfig = {
      label: 'EdgeAgent',
      agencyUrl: 'http://0480c49d.ngrok.io', // TODO: Replace with Mediator URL
      url: 'http://0480c49d.ngrok.io', // TODO: Replace with Mediator URL
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
    this.agent = new Agent(indy, config, inboundTransporter, outboundTransporter);
    this.state = {invitationUrl: 'Foo'};
  }

  _provisionWallet = async () => {
    console.log('Provisioning wallet...');
    await this.agent.init();
    //const invitationUrl = await this.agent.createInvitationUrl();
    //console.log('Invitation URL', invitationUrl);
    //this.setState({invitationUrl});
    console.log('Wallet ready :)');
  };

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button onPress={this._provisionWallet} title="Provision Wallet" />
        <View>
          <QRCode value={this.state.invitationUrl} size={200} />
        </View>
      </View>
    );
  }
}
*/
