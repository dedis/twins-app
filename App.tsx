/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

global.Buffer = global.Buffer || require('buffer').Buffer;
import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { Agent } from 'aries-framework-javascript';
import { RealTimeInboundTransporter, HTTPOutboundTransporter } from './transporters';
// @ts-ignore
import indy from 'rn-indy-sdk';
import { InitConfig } from 'aries-framework-javascript/build/lib/types';
import RNFS from 'react-native-fs';
// @ts-ignore
import debug from 'debug';
import QRCode from 'react-native-qrcode-svg';

debug.enable('aries-framework-javascript');

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
