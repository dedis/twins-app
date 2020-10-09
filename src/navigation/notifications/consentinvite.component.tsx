import React, { useEffect } from 'react';
import { useSafeArea, SafeAreaView } from "react-native-safe-area-context"
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "src/app/rootReducer";
import { View, Text } from "react-native";
import { ConnectionInvitationMessage } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage";
import { Button, Layout, TopNavigation, Card, StyleService, useStyleSheet, Spinner } from "@ui-kitten/components";
import { NotificationState, updateNotificationState } from "./notificationsSlice";
import logger from "aries-framework-javascript/build/lib/logger"
import { ConsentInvitationMessage } from "src/agent/protocols/consent/ConsentInvitationMessage";
import { plainToClass, classToPlain } from 'class-transformer';
import agentModule, { EdgeAgent } from 'src/agent/agent';

export const ConsentInviteScreen = ({ navigation }) => {
    const safeArea = useSafeArea();

    const agent = agentModule.getAgent();
    const notificationId = navigation.getParam('notificationId');

    const notifications = useSelector((state: RootState) => state.notifications);
    const [ busy, setBusy ] = React.useState<boolean>(false);

    const notification = notifications.itemsById[notificationId];
    const payload = plainToClass(ConsentInvitationMessage, notification.payload);

    const themedStyles = StyleService.create({
        container: {
            flex: 1,
        },
        description: {
            color: 'color-basic-500',
            fontSize: 15,
        }
    });
    const styles = useStyleSheet(themedStyles);

    const onAccept = async () => {
        setBusy(true);
        await (agent as EdgeAgent).consentModule.requestConsentInformation(notificationId);
        setBusy(false);
        navigation.pop();
        navigation.navigate('ConsentInformationRequest', { notificationId });
    }

    const onDeny = async () => {
        setBusy(true);
        await (agent as EdgeAgent).consentModule.denyInvite(notificationId);
        setBusy(false);
        logger.log('Denied');
    }

    const REQUEST_MORE = 'Request more information';
    const IGNORE = 'Ingore this request'

    const denied = (
        <Button disabled>{IGNORE}</Button>
    )

    const undecided = (
        <View>
            <Button style={{ marginBottom: 20 }} onPress={onAccept}>{REQUEST_MORE}</Button>
            <Button onPress={onDeny}>{IGNORE}</Button>
        </View>
    )

    const waiting = (
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Spinner size='large' />
          </Layout>
        </SafeAreaView>
    );

    if (busy) {
        return waiting;
    }

    return (
        <Layout
            style={[styles.container, { paddingTop: safeArea.top }]}
            level='2'
        >
            <TopNavigation
                alignment='center'
                title='Consent Invitation'
            />
            <View style={{ margin: 10, flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <Card style={{ marginBottom: 25 }}>
                    <View>
                        <Text style={styles.description}>{payload.synopsis}</Text>
                    </View>
                </Card>
                { notification.state === NotificationState.INVITED && undecided}
                { notification.state === NotificationState.INVITE_DENIED && denied}
            </View>
        </Layout>
    );
}