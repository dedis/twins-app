import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, TopNavigationAction, IconElement, Icon } from '@ui-kitten/components'
import { useSafeArea } from 'react-native-safe-area-context';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { ImageStyle } from 'react-native';

export const ScanScreen = ({ navigation, screenProps }) => {
  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
  });

  const safeArea = useSafeArea();
  const styles = useStyleSheet(themedStyles);

  const { agent } = screenProps;

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
    console.log('Accepting invitation...');
    await agent.acceptInvitationUrl(e.data);
    console.log('Done');
    navigation.navigate('Notifications');
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