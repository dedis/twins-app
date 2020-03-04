import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, TopNavigationAction, IconElement, Icon, Card, Button } from '@ui-kitten/components'
import { useSafeArea } from 'react-native-safe-area-context';
import { ImageStyle, View, Text, StyleSheet } from 'react-native';
import rosterData from '../roster';
import DarcInstance from '@dedis/cothority/byzcoin/contracts/darc-instance';
import { Rule, SignerEd25519, IdentityDid } from '@dedis/cothority/darc';
import { Roster } from '@dedis/cothority/network/proto';
import ByzCoinRPC from '@dedis/cothority/byzcoin/byzcoin-rpc';
import { createOutboundMessage } from 'aries-framework-javascript/build/lib/protocols/helpers';
import { Agent } from 'aries-framework-javascript';
import { createConsentResponse, ConsentStatus } from '../agent/protocols/consent/messages';
import { SkipchainRPC, SkipBlock } from '@dedis/cothority/skipchain';
import { GetUpdateChain, GetUpdateChainReply } from '@dedis/cothority/skipchain/proto';
import { RosterWSConnection } from '@dedis/cothority/network/connection';
import { bcID } from '../App';

export const ConsentRequestScreen = ({ navigation, screenProps }) => {
  const safeArea = useSafeArea();

  const { agent } = screenProps;
  const { documentDarc, publicDid, orgName, studyName, verkey } = navigation.getParam('data');
  // const [ documentDarc, publicDid, orgName, studyName, verkey ] = ['', '', 'DEDIS Pharma', 'amphotericin in-vitro trial', '13123123132'];

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
    try {
      const roster = Roster.fromTOML(rosterData);
      console.log('got roster');
      const genesisBlock = Buffer.from(bcID, 'hex');
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
          console.warn("Would need a RosterWSConnection to continue");
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

  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
    button: {
    },
    cardText: {
      paddingBottom: 10,
      marginBottom: 10,
      color: 'color-basic-500'
    },
    headerText: {
      padding: 25,
      color: 'color-basic-500'
    },
  });

  const styles = useStyleSheet(themedStyles);


  const FooterDeny = () => (
    <View style={styles.container}>
      <Button
        style={styles.button}
        size='small' status='danger'>
        No Thanks.
      </Button>
    </View>
  );

  const Header = () => (
    <Text style={styles.headerText}>
      <Text style={{fontWeight: 'bold'}}>{orgName}</Text> invites you to share your biological and digital samples
      in order to participate in the study: <Text style={{fontWeight: 'bold'}}>{studyName}</Text>
    </Text>
  )

  const Footer = () => (
    <View>
      <Text style={styles.cardText}>
        If you do not consent, no information will be shared about you. {orgName} will know
        that some patients have declined to share their data, but will not know your
        identity.
      </Text>
      <Button
        style={styles.button}
        size='small' status='danger'>
        NO THANKS
      </Button>
    </View>
  );

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
      <View style={{margin: 10, flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <Card header={Header} footer={Footer}>
          <View>
            <Text style={styles.cardText}>
              When you consent to share your data with {orgName}, your biological samples and data about you
              will be securely released to them.
              {"\n\n"}
              You can revoke this consent at any time, and {orgName} will be notified and is required to destroy
              data about you and samples from you.
            </Text>
            <Button
              style={styles.button}
              size='small'
              status='primary'
              onPress={onGrantConsent}
            >
              I CONSENT
            </Button>
          </View>
        </Card>
      </View>
    </Layout>
  )
}