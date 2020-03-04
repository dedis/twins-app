import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-navigation';
import { Image } from 'react-native';
import { Button, Layout, Spinner } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import {myTheme as appTheme} from '../custom-theme';
import RNFS from 'react-native-fs';
import images from '../res/images';
import { Connection } from 'aries-framework-javascript';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';
import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { MessageType as ConsentMessageType, ConsentStatus } from '../agent/protocols/consent/messages';
import { consentService } from '../config';

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

  const { agent, listenerState, setListenerState, setConnectionState, setNotificationState } = screenProps;

  useEffect(() => {
    console.log(`Listener State: ${listenerState}`);
    if (listenerState) {
      return;
    }
    console.log('Registered event listeners');
    agent.context.eventEmitter.on(Event.CONNECTION_ESTABLISHED, (connection: Connection) => {
      if (connection.theirDidDoc && connection.theirDidDoc.id) {
        setConnectionState(prevConnections => [
          ...prevConnections,
          {
            title: '',
            description: '',
            route: 'Chat',
            connection,
            // @ts-ignore
            did: connection.theirDidDoc.id,
          }
        ]);
      }
    });

    agent.context.eventEmitter.on(Event.MESSAGE_RECEIVED, (message: InboundMessage) => {
      if (message.message['@type'] && message.message['@type'] == ConsentMessageType.ConsentChallengeResponse) {
        // TODO: Move this to handler
        const connection = agent.findConnectionByTheirKey(message.sender_verkey);
        if (!connection) {
          return;
        }
        if (consentService.verifyChallengeResponse(connection, message.message.nonce)) {
          console.log('Nonce verified');
          // @ts-ignore
          const { documentDarc, orgName, studyName, publicDid, } = consentService.getDataForRequest(connection);
          const { verkey } = connection;
          setNotificationState(prevNotifications => [
            ...prevNotifications,
            {
              title: 'Consent Request',
              description: `${orgName} would like to request your consent for their study on ${studyName}`,
              route: 'ConsentRequest',
              documentDarc,
              orgName,
              studyName,
              publicDid,
              status: ConsentStatus.UNDECIDED,
              verkey
            }
          ]);
          setConnectionState(prevConnections => {
            // @ts-ignore
            const idx = prevConnections.findIndex(c => c.did === connection.theirDidDoc.id);
            console.log(`idx: ${idx}`);
            const c = prevConnections[idx];
            return [
              ...prevConnections.slice(0, idx),
              {
                ...c,
                description: `Peer DID: ${connection.theirDid} Public DID: ${publicDid}`,
                title: orgName
              },
              ...prevConnections.slice(idx + 1),
            ];
          });
        }
      }
    });
    setListenerState(true);
  }, [])

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
          <Image style={{ flex: 6, width: '100%', resizeMode: 'stretch' }} source={images.bg} />
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