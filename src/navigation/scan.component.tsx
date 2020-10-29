import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, TopNavigationAction, IconElement, Icon } from '@ui-kitten/components'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { ImageStyle } from 'react-native';
import { Agent } from 'aries-framework-javascript';
import { ConnectionInvitationMessage } from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage';
import { plainToClass } from "class-transformer";
import agentModule from 'src/agent/agent';
import { SafeAreaView } from 'react-navigation';

export const ScanScreen = ({ navigation }) => {
  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
    safeArea: {
      backgroundColor: '$background-basic-color-1',
      flex: 1,
      color: '$text-basic-color',
    }
  });

  const styles = useStyleSheet(themedStyles);

  const agent = agentModule.getAgent();

  const renderBackAction = (): React.ReactElement => {
    return <TopNavigationAction
      icon={BackIcon}
      onPress={() => navigation.goBack()}
    />
  };

  const BackIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name='arrow-ios-back' />
  );

  const onRead = async (e: any) => {
    console.log('Accepting invitation...', e.data);
    const invitationJSON: {} = JSON.parse(e.data);
    const invite = plainToClass(ConnectionInvitationMessage, invitationJSON);
    // @ts-ignore
    if (invitationJSON['@type'].includes('connections/1.0')) {
      await (agent as Agent).connections.acceptInviteWithPublicDID(invite);
      console.log('Accepted invite');
    } else {
      await (agent as Agent).didexchange.acceptInviteWithPublicDID(invite);
    }
    console.log('Done');
    navigation.navigate('Connections');
  }

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout
        style={[styles.container]}
        level='2'
      >
        <TopNavigation
          alignment='center'
          title='Scan Invite'
          leftControl={renderBackAction()}
        />
        <QRCodeScanner onRead={onRead} />
      </Layout>
    </SafeAreaView>
  )
}