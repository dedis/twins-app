import React from 'react';
import { SafeAreaView } from 'react-navigation';
import { Image } from 'react-native';
import { Button, Layout, Spinner } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import {default as appTheme} from '../custom-theme.json';
import RNFS from 'react-native-fs';
import images from '../res/images';

enum AgentState {
  UNPROVISIONED,
  PROVISIONING,
  PROVISIONED,
  CREATING_INVITE,
  INVITE_CREATED,
}

export const HomeScreen = ({ navigation, screenProps }) => {

  const [ provisionState, setAgentState ] = React.useState<AgentState>(AgentState.UNPROVISIONED);
  const [ inviteUrl, setInviteUrl ] = React.useState<string>('');

  const { agent } = screenProps;

  const onProvisionPress = async () => {
    console.log('Provisioning...');
    setAgentState(AgentState.PROVISIONING);
    // TODO: Why does agent.init() not just open the existing wallet?
    RNFS.unlink(RNFS.DocumentDirectoryPath + '/.indy_wallet')
      .then(() => {
        console.log("Old wallet nuked.")
      })
      .catch((err: Error) => {
        console.log('Ignored error from wallet cleanup: ', err.message);
      })
    await agent.init();
    setAgentState(AgentState.PROVISIONED)
  };

  const onCreateInvite = async () => {
    setAgentState(AgentState.CREATING_INVITE);
    const invitationUrl = await agent.createInvitationUrl();
    setInviteUrl(invitationUrl);
    console.log('invitationUrl', invitationUrl);
    setAgentState(AgentState.INVITE_CREATED);
  }

  const onScanInvite = () => {
    navigation.navigate('Scan');
  }

  switch (provisionState) {
    case AgentState.UNPROVISIONED:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button onPress={onProvisionPress}>Provision Agent</Button>
          </Layout>
        </SafeAreaView>
      );
    case AgentState.PROVISIONING:
    case AgentState.CREATING_INVITE:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Spinner size='large' />
          </Layout>
        </SafeAreaView>
      )
    case AgentState.PROVISIONED:
      return (
        <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
          <Image style={{flex: 6, width: '100%', resizeMode: 'stretch'}} source={images.bg}/>
          <Layout style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <Button onPress={onCreateInvite}>Create Invite</Button>
            <Button onPress={onScanInvite}>Scan Invite</Button>
          </Layout>
        </SafeAreaView>
      )
    case AgentState.INVITE_CREATED:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <QRCode color={appTheme['color-primary-500']} backgroundColor='white' value={inviteUrl} size={200} />
          </Layout>
        </SafeAreaView>
      )
  }
};