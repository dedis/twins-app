import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, TopNavigationAction, IconElement, Icon, Card, Button } from '@ui-kitten/components'
import { useSafeArea } from 'react-native-safe-area-context';
import { ImageStyle, View, Text, StyleSheet } from 'react-native';
import { color } from 'react-native-reanimated';
import rosterData from '../roster';
import Cothority from '@dedis/cothority';
import DarcInstance from '@dedis/cothority/byzcoin/contracts/darc-instance';
import { Rule, SignerEd25519, IdentityDid } from '@dedis/cothority/darc';
import { Roster } from '@dedis/cothority/network/proto';
import ByzCoinRPC from '@dedis/cothority/byzcoin/byzcoin-rpc';
import Log from '@dedis/cothority/log';
import { createOutboundMessage } from 'aries-framework-javascript/build/lib/protocols/helpers';
import { Connection, Agent } from 'aries-framework-javascript';
import { createConsentResponse, ConsentStatus } from '../agent/protocols/consent/messages';

export const ConsentRequestScreen = ({ navigation, screenProps }) => {
  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
  });

  const safeArea = useSafeArea();
  let styles = useStyleSheet(themedStyles);

  const { agent } = screenProps;
  const {documentDarc, publicDid, comment, verkey } = navigation.getParam('data');

  const renderBackAction = (): React.ReactElement => {
    return <TopNavigationAction
      icon={BackIcon}
      onPress={() => navigation.goBack()}
    />
  };

  const BackIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name='arrow-ios-back' />
  );

  const onGrantConsent = async () => {
    // Log.lvl = 4;
    const roster = Roster.fromTOML(rosterData);
    console.log('got roster');
    console.log('Getting rpc instance');
    const byzcoinRPC = await ByzCoinRPC.fromByzcoin(
      roster,
      Buffer.from('310ccffa343718ae4a29164bb74e8b8dee59fae302a3b5a131ff37bee8ca6224', 'hex'),
    );
    console.log('Got rpc instance');
    const darc = await DarcInstance.fromByzcoin(byzcoinRPC, Buffer.from(documentDarc, 'hex'));
    const newDarc = darc.darc.evolve();
    console.log('evolved darc in memory');
    const identityProps = { did: publicDid }; // Other things not required since only toString is called on the identity
    const identity = new IdentityDid(identityProps);
    // await identity.init(); // no need to init
    newDarc.rules.appendToRule('spawn:calypsoRead', identity, Rule.OR);
    const signer = SignerEd25519.fromBytes(Buffer.from('ca24611e1fcbd5c811fd4607d2130dfab037fca0b4b49d286aebe4ef612fe10c', 'hex'));
    console.log('created signer');
    await darc.evolveDarcAndWait(newDarc, [signer], 100);
    console.log(`Evolved darc and added ${publicDid} to spawn:calypsoRead rule`);

    const connection = (agent as Agent).findConnectionByMyKey(verkey);
    if (!connection) {
      throw new Error(`connection with our verkey ${verkey} does not exist`);
    }
    await agent.context.messageSender.sendMessage(createOutboundMessage(
      connection,
      createConsentResponse(documentDarc, ConsentStatus.GRANTED)
    ));
    console.log('Sent consent response');
  }

  const Footer = () => (
    <View style={footerStyles.container}>
      <Button
        style={footerStyles.control}
        size='small'
        status='danger' >
        DENY
      </Button>
      <Button
        style={footerStyles.control}
        size='small'
        status='primary'
        onPress={onGrantConsent}
      >
        GRANT
      </Button>
    </View>
  );

  const footerStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    control: {
      marginHorizontal: 4,
    }
  });

  return (
    <Layout
      style={[styles.container, { paddingTop: safeArea.top }]}
      level='2'
    >
      <TopNavigation
        alignment='center'
        title='Consent Request'
        leftControl={renderBackAction()}
      />
      <View style={{margin: 10}}>
        <Card footer={Footer}>
          <Text>
            {comment}
          </Text>
        </Card>
      </View>
    </Layout>
  )
}