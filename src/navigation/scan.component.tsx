import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, TopNavigationAction, IconElement, Icon } from '@ui-kitten/components'
import { useSafeArea } from 'react-native-safe-area-context';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { ImageStyle } from 'react-native';
import { Agent } from 'aries-framework-javascript';
import { ConnectionInvitationMessage } from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage';
import { plainToClass } from "class-transformer";
import agentModule from 'src/agent/agent';

export const ScanScreen = ({ navigation }) => {
  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
  });

  const safeArea = useSafeArea();
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
    await (agent as Agent).didexchange.acceptInviteWithPublicDID(invite);
    console.log('Done');
    navigation.navigate('Connections');
  }

  return (
    <Layout
      style={[styles.container, { paddingTop: safeArea.top }]}
      level='2'
    >
      <TopNavigation
        alignment='center'
        title='Scan Invite'
        leftControl={renderBackAction()}
      />
      <QRCodeScanner onRead={onRead} />
    </Layout>
  )
}