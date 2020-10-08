import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-navigation';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { Button, Layout, Spinner, Text } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import { myTheme } from '../app/custom-theme';
import RNFS from 'react-native-fs';
import { EdgeAgent } from 'src/agent/agent';
import { agentConfig, genesis_txn, walletPath } from 'src/app/config';
import { Agent } from 'aries-framework-javascript';
import { useDispatch } from 'react-redux';
import { addConnections } from 'src/navigation/connections/connectionsSlice'
import { ConnectionState } from 'aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState';
import * as Keychain from 'react-native-keychain';
import agentModule from 'src/agent/agent';
import * as crypto from 'crypto';
import { IOS } from 'react-native-permissions/lib/typescript/constants';

enum AgentState {
  INIT,
  WALLET_FOUND,
  WALLET_NOT_FOUND,
  WALLET_FOUND_KEY_FOUND,
  WALLET_FOUND_KEY_NOT_FOUND,
  WRITE_PERMISSION_DENIED,
}

export const HomeScreen = ({ navigation, screenProps }) => {
  const dispatch = useDispatch();
  const [ provisionState, setAgentState ] = React.useState<AgentState>(AgentState.INIT);
  const [ inviteUrl, setInviteUrl ] = React.useState<string>('');

  const { agent } = screenProps;

  const keylist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$%^&*()-+'

  // const onCreateInvite = async () => {
  //   setAgentState(AgentState.CREATING_INVITE);
  //   const invitationUrl = await agent.createInvitationUrl();
  //   setInviteUrl(invitationUrl);
  //   console.log('invitationUrl', invitationUrl);
  //   setAgentState(AgentState.INVITE_CREATED);
  // }

  const connectToPool = async () => {
    const path = `${RNFS.DocumentDirectoryPath}/genesis.txn`;
    const exists = await RNFS.exists(path)
    switch (Platform.OS) {
      case 'android':
      if (!exists) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: 'Store the genesis file',
          message: 'Edge Agent needs your permission to store a file',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await RNFS.writeFile(path, genesis_txn);
          console.log('Genesis txn file at ', path);
          await (agentModule.getAgent() as EdgeAgent).ledger.connect('buildernet', { genesis_txn: path });
        } else {
          setAgentState(AgentState.WRITE_PERMISSION_DENIED);
        }
      } else {
        await (agentModule.getAgent() as EdgeAgent).ledger.connect('buildernet', { genesis_txn: path });
      }
    case 'ios':
      if (!exists) {
        await RNFS.writeFile(path, genesis_txn);
      }
      await (agentModule.getAgent() as EdgeAgent).ledger.connect('buildernet', { genesis_txn: path });
    }
  }

  // Inflate the state from wallet
  const inflateStateFromDB = async () => {
    const connections = await (agentModule.getAgent() as EdgeAgent).didexchange.getAll();
    const items = connections.filter(connection => connection.state === ConnectionState.COMPLETE).map(connection => ({
      title: connection.invitation?.label!,
      description: `Connected using identifier: ${connection.did}`,
    }));
    dispatch(addConnections(items));
  }

  const onScanInvite = () => {
    navigation.navigate('Scan');
  }

  useEffect(() => {
    async function startup() {
      const walletExists = await RNFS.exists(walletPath);
      if (walletExists) {
        setAgentState(AgentState.WALLET_FOUND);
        try {
          const key = await Keychain.getGenericPassword({
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
            authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
            accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
            securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
          })
          if (key) {
            agentConfig.walletCredentials.key = key.password;
            await agentModule.init(agentConfig);
            await connectToPool();
            await inflateStateFromDB();
            setAgentState(AgentState.WALLET_FOUND_KEY_FOUND)
          } else {
            setAgentState(AgentState.WALLET_FOUND_KEY_NOT_FOUND);
          }
        } catch (error) {
          console.log("Error accessing keychain", error);
        }
      } else {
        setAgentState(AgentState.WALLET_NOT_FOUND);
      }
    }

    startup();
  }, []);

  /*
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
  */
 
const onShareSecret = () => {
  Alert.alert('TODO: onShareSecret');
}
const onCreateNewWallet = async (_delete: boolean) => {
  if (_delete) {
    await RNFS.unlink(walletPath);
  }
  agentConfig.walletCredentials.key = Array.from(crypto.randomFillSync(Buffer.alloc(15)))
    .map((x) => keylist[x % keylist.length])
    .join('');
  
  await Keychain.setGenericPassword(walletPath, agentConfig.walletCredentials.key, {
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  })
  await agentModule.init(agentConfig)
}

switch (provisionState) {
  case AgentState.INIT:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Spinner size='large' />
          </Layout>
        </SafeAreaView>
      )
    case AgentState.WALLET_FOUND:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Wallet Found</Text>
            <Spinner size='large' />
          </Layout>
        </SafeAreaView>
      )
    case AgentState.WALLET_FOUND_KEY_FOUND:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <Button onPress={onScanInvite}>Scan Invite</Button>
            <Button onPress={onShareSecret}>Share Secret</Button>
          </Layout>
        </SafeAreaView>
      )
    case AgentState.WALLET_FOUND_KEY_NOT_FOUND:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ padding: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>We found an existing wallet but the key doesn't exist in your keychain.</Text>
            <Button onPress={() => onCreateNewWallet(true)}>Create New Wallet</Button>
            <Button>Recover Key</Button>
          </Layout>
        </SafeAreaView>
      )
    case AgentState.WALLET_NOT_FOUND:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ padding: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button onPress={() => onCreateNewWallet(false)}>Create New Wallet</Button>
          </Layout>
        </SafeAreaView>
      )
    case AgentState.WRITE_PERMISSION_DENIED:
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ padding: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Cannot connect to the network without write permission</Text>
          </Layout>
        </SafeAreaView>
      )
 }
};