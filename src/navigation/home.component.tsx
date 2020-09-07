import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-navigation';
import { Image, PermissionsAndroid } from 'react-native';
import { Button, Layout, Spinner } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import { myTheme } from '../app/custom-theme';
import RNFS from 'react-native-fs';
import { EdgeAgent } from 'src/agent/agent';
import { genesis_txn } from 'src/app/config';
import { Agent } from 'aries-framework-javascript';
import { useDispatch } from 'react-redux';
import { addConnections } from 'src/navigation/connections/connectionsSlice'
import { ConnectionState } from 'aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState';

enum AgentState {
  UNPROVISIONED,
  PROVISIONING,
  PROVISIONED,
  CREATING_INVITE,
  INVITE_CREATED,
}

export const HomeScreen = ({ navigation, screenProps }) => {
  const dispatch = useDispatch();
  const [ provisionState, setAgentState ] = React.useState<AgentState>(AgentState.UNPROVISIONED);
  const [ inviteUrl, setInviteUrl ] = React.useState<string>('');

  const { agent } = screenProps;

  /*
  useEffect(() => {
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
  */

  const onProvisionPress = async () => {
    console.log('Provisioning...');
    setAgentState(AgentState.PROVISIONING);
    // TODO: Why does agent.init() not just open the existing wallet?
    /*
    RNFS.unlink(RNFS.DocumentDirectoryPath + '/.indy_wallet')
      .then(() => {
        console.log("Old wallet nuked.")
      })
      .catch((err: Error) => {
        console.log('Ignored error from wallet cleanup: ', err.message);
      })
    */
    await agent.init();
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
      title: 'Store the genesis file',
      message: 'Edge Agent needs your permission to store transactions locally in your mobile',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const path = `${RNFS.ExternalStorageDirectoryPath}/genesis.txn`;
      RNFS.writeFile(path, genesis_txn);
      console.log('Genesis txn file at ', path);
      await (agent as EdgeAgent).ledger.connect('buildernet', { genesis_txn: path });

      // Inflate the connections state
      const connections = await (agent as EdgeAgent).didexchange.getAll();
      const items = connections.filter(connection => connection.state === ConnectionState.COMPLETE).map(connection => ({
        title: connection.invitation?.label!,
        description: `Connected using identifier: ${connection.did}`,
       }));
      dispatch(addConnections(items));
      setAgentState(AgentState.PROVISIONED);
    } else {
      setAgentState(AgentState.UNPROVISIONED);
    }
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
            <QRCode color={myTheme['color-primary-500']} backgroundColor='white' value={inviteUrl} size={200} />
          </Layout>
        </SafeAreaView>
      )
  }
};