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
import { SkipchainRPC, SkipBlock } from '@dedis/cothority/skipchain';
import { GetUpdateChain, GetUpdateChainReply } from '@dedis/cothority/skipchain/proto';
import { RosterWSConnection } from '@dedis/cothority/network/connection';

export const ConsentRequestScreen = ({ navigation, screenProps }) => {
  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
  });

  const safeArea = useSafeArea();
  let styles = useStyleSheet(themedStyles);

  const { agent } = screenProps;
  const { documentDarc, publicDid, comment, verkey } = navigation.getParam('data');

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
    try {
      const roster = Roster.fromTOML(rosterData);
      console.log('got roster');
      const genesisBlock = Buffer.from('310ccffa343718ae4a29164bb74e8b8dee59fae302a3b5a131ff37bee8ca6224', 'hex');
      const skipchainRpc = new SkipchainRPC(roster);
      const latestBlock = await getLatestBlock(skipchainRpc, genesisBlock, false);
      console.log(`LatestBlock id: ${latestBlock.hash.toString('hex')}`)
      console.log('Getting rpc instance');
      const byzcoinRPC = await ByzCoinRPC.fromByzcoin(
        roster,
        genesisBlock,
        undefined,
        undefined,
        latestBlock
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
    } catch (e) {
      console.log(e);
    }
  }

  const getLatestBlock = async (tthis: SkipchainRPC, latestID: Buffer, verify: boolean = true) => {
    const blocks: SkipBlock[] = [];
    // Run as long as there is a new blockID to be checked
    for (let previousID = Buffer.alloc(0); !previousID.equals(latestID);) {
      previousID = latestID;
      const req = new GetUpdateChain({ latestID });
      // @ts-ignore
      const ret = await tthis.conn.send<GetUpdateChainReply>(req, GetUpdateChainReply);
      const newBlocks = ret.update;
      if (newBlocks.length === 0) {
        // @ts-ignore
        if (tthis.conn instanceof RosterWSConnection) {
          // @ts-ignore
          tthis.conn.invalidate(tthis.conn.getURL());
          continue;
        } else {
          Log.warn("Would need a RosterWSConnection to continue");
          break;
        }
      }

      if (verify) {
        const err = tthis.verifyChain(newBlocks, latestID);
        if (err) {
          throw new Error(`invalid chain received: ${err.message}`);
        }
      }
      blocks.push(...newBlocks);

      // First check if the replying node is in the roster of the
      // latest block.
      const last = newBlocks[newBlocks.length - 1];

      if (last.forwardLinks.length === 0) {
        break;
      }

      const fl = last.forwardLinks.slice(-1)[0];
      latestID = fl.to;
      if (fl.newRoster) {
        // @ts-ignore
        if (tthis.conn instanceof RosterWSConnection) {
          // @ts-ignore
          tthis.conn.setRoster(fl.newRoster);
        } else {
          // @ts-ignore
          tthis.conn = new RosterWSConnection(fl.newRoster, SkipchainRPC.serviceName);
        }
      }
    }
    return blocks.pop() as SkipBlock;
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
      <View style={{ margin: 10 }}>
        <Card footer={Footer}>
          <Text>
            {comment}
          </Text>
        </Card>
      </View>
    </Layout>
  )
}