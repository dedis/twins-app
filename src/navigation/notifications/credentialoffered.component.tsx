import {
  Button,
  Card,
  Layout,
  Spinner,
  StyleService,
  Text,
  TopNavigation,
  useStyleSheet,
} from '@ui-kitten/components';
import React, {useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from 'src/app/rootReducer';
import {plainToClass} from 'class-transformer';
import {CredentialOfferMessage} from '@gnarula/aries-framework-javascript/build/lib/protocols/credentials/messages/CredentialOfferMessage';
import agentModule from 'src/agent/agent';
import {CredentialState} from '@gnarula/aries-framework-javascript/build/lib/protocols/credentials/CredentialState';

export const CredentialScreen = ({navigation}) => {
  const notificationId = navigation.getParam('notificationId');

  const notifications = useSelector((state: RootState) => state.notifications);
  const [busy, setBusy] = React.useState<boolean>(false);

  const notification = notifications.itemsById[notificationId];
  // @ts-ignore
  const offer: CredentialOfferMessage = plainToClass(
    CredentialOfferMessage,
    notification.payload.offer,
  );
  // @ts-ignore
  const [credentialState, setCredentialState] = useState<CredentialState>(
    CredentialState.OfferReceived,
  );

  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
    description: {
      color: 'color-basic-500',
      fontSize: 15,
    },
    safeArea: {
      backgroundColor: '$background-basic-color-1',
      flex: 1,
      color: '$text-basic-color',
    },
  });

  const styles = useStyleSheet(themedStyles);

  const sendCredentialRequest = async () => {
    setBusy(true);
    const credentialRecord = await agentModule
      .getAgent()
      ?.credentials.find(notificationId)!;
    await agentModule
      .getAgent()
      ?.credentials.acceptCredential(credentialRecord);
    setCredentialState(CredentialState.CredentialIssued);
    setBusy(false);
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

  const attributes = [];

  for (let i = 0; i < offer.credentialPreview.attributes.length; i++) {
    const attrib = offer.credentialPreview.attributes[i];
    attributes.push(
      <Text style={{paddingVertical: 10}} key={i}>
        {attrib.name}: {attrib.value}
      </Text>,
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={[styles.container]} level="2">
        <TopNavigation alignment="center" title="Credential Offer" />
        <View
          style={{
            margin: 10,
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <Card style={{marginBottom: 25}}>
            <View>{attributes}</View>
            <Button
              disabled={credentialState !== CredentialState.OfferReceived}
              onPress={sendCredentialRequest}>
              {credentialState === CredentialState.OfferReceived
                ? 'Accept'
                : 'Accepted'}
            </Button>
          </Card>
        </View>
      </Layout>
    </SafeAreaView>
  );
};
