import React from 'react';
import {
  Layout,
  TopNavigation,
  useStyleSheet,
  StyleService,
  Card,
  Button,
  Spinner,
} from '@ui-kitten/components';
import {View, Text, Linking, Alert, ToastAndroid} from 'react-native';
import logger from 'aries-framework-javascript/build/lib/logger';
import {EdgeAgent} from 'src/agent/agent';
import {useSelector} from 'react-redux';
import {RootState} from 'src/app/rootReducer';
import {NotificationScreen} from './notification.component';
import {NotificationState} from './notificationsSlice';
import {ConsentInformationRequestMessage} from 'src/agent/protocols/consent/ConsentInformationRequestMessage';
import {plainToClass} from 'class-transformer';
import {ConsentInformationResponseMessage} from 'src/agent/protocols/consent/ConsentInformationResponseMessage';
import agentModule from 'src/agent/agent';
import {SafeAreaView} from 'react-navigation';

export const ConsentInformationRequestScreen = ({navigation}) => {
  const [busy, setBusy] = React.useState<boolean>(false);

  const agent = agentModule.getAgent()!;

  const themedStyles = StyleService.create({
    safeArea: {
      backgroundColor: '$background-basic-color-1',
      flex: 1,
      color: '$text-basic-color',
    },
    container: {
      flex: 1,
    },
    description: {
      color: 'color-basic-500',
      fontSize: 15,
    },
    link: {
      color: 'color-info-500',
      fontSize: 15,
    },
    waiting: {
      color: 'color-basic-500',
      fontSize: 15,
    },
  });

  const styles = useStyleSheet(themedStyles);

  const notificationId = navigation.getParam('notificationId');

  const notifications = useSelector((state: RootState) => state.notifications);
  const notification = notifications.itemsById[notificationId];

  const onGrant = async () => {
    setBusy(true);
    await (agent as EdgeAgent).consentModule.grantConsent(notificationId);
    setBusy(false);
  };

  const onDeny = async () => {
    ToastAndroid.show('Unimplemented 🙈', ToastAndroid.SHORT);
  };

  const waiting = (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Spinner size="large" />
      </Layout>
    </SafeAreaView>
  );

  if (busy) {
    return waiting;
  }

  const requested = (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={[styles.container]} level="2">
        <TopNavigation alignment="center" title="Consent Information" />
        <View
          style={{
            margin: 10,
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <Card>
            <View>
              <Text style={styles.waiting}>
                Please wait while we get more information about the study.
              </Text>
            </View>
          </Card>
        </View>
      </Layout>
    </SafeAreaView>
  );

  if (
    !!notification &&
    notification.state == NotificationState.INFORMATION_REQUESTED
  ) {
    return requested;
  }

  const payload = plainToClass(
    ConsentInformationResponseMessage,
    notification.payload,
  );

  const goToMoreInfo = async () => {
    const url = payload.moreInfoLink;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return;
    }
    Alert.alert('Unsupported URL');
  };

  const granted = <Button disabled>{payload.acceptText}</Button>;

  const denied = <Button disabled>{payload.denyText}</Button>;

  const undecided = (
    <View>
      <Button style={{marginBottom: 20}} onPress={onGrant}>
        {payload.acceptText}
      </Button>
      <Button onPress={onDeny}>{payload.denyText}</Button>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={[styles.container]} level="2">
        <TopNavigation alignment="center" title="Consent Information" />
        <View
          style={{
            margin: 10,
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <Card style={{marginBottom: 25}}>
            <View>
              <Text style={styles.description}>{payload.description}</Text>
              {payload.moreInfoLink.length > 0 && (
                <View style={{marginTop: 20}}>
                  <Text style={styles.description}>
                    For more information, please visit:
                  </Text>
                  <Text style={styles.link} onPress={goToMoreInfo}>
                    {payload.moreInfoLink}
                  </Text>
                </View>
              )}
            </View>
          </Card>
          {notification.state === NotificationState.CONSENT_GRANTED && granted}
          {notification.state === NotificationState.CONSENT_DENIED && denied}
          {notification.state === NotificationState.INFORMATION_PROVIDED &&
            undecided}
        </View>
      </Layout>
    </SafeAreaView>
  );
};
