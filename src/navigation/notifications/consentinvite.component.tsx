import React, { useEffect } from 'react';
import { useSafeArea } from "react-native-safe-area-context"
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "src/app/rootReducer";
import { View, Text } from "react-native";
import { ConnectionInvitationMessage } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage";
import { Button, Layout, TopNavigation, Card, StyleService, useStyleSheet } from "@ui-kitten/components";
import { NotificationState, updateNotificationState } from "./notificationsSlice";
import logger from "aries-framework-javascript/build/lib/logger"
import { ConsentInvitationMessage } from "src/agent/protocols/consent/ConsentInvitationMessage";
import { plainToClass, classToPlain } from 'class-transformer';
import { EdgeAgent } from 'src/agent/agent';

export const ConsentInviteScreen = ({ navigation, screenProps }) => {
    const safeArea = useSafeArea();

    const { agent } = screenProps;
    const notificationId = navigation.getParam('notificationId');

    const notifications = useSelector((state: RootState) => state.notifications);

    const notification = notifications.itemsById[notificationId];
    logger.logJson('notification', notification);
    const payload = plainToClass(ConsentInvitationMessage, notification.payload);


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
        currentStatusContainer: {
            color: 'color-basic-500',
            marginTop: 15,
            borderTopWidth: 1,
        }
    });
    const styles = useStyleSheet(themedStyles);

    const onAccept = async () => {
        logger.log('Accepted. Requesting information');
        await (agent as EdgeAgent).consentModule.requestConsentInformation(notificationId);
        logger.log('Got information');
    }

    const onDeny = async () => {
        logger.log('Denied');
        await (agent as EdgeAgent).consentModule.denyInvite(notificationId);
        logger.log('Denied');
    }

    const Header = () => (
        <View>
            <Text>Synopsis {payload.synopsis}</Text>
        </View>
    );

    const Footer = () => (
        <View>
            <Button
                onPress={onDeny}
                size='small' status='danger'>
                NO THANKS
            </Button>
        </View>
    )

    const invited = (
        <Card header={Header} footer={Footer}>
            <Button
                onPress={onAccept}
                size='small' status='danger'>
                TELL ME MORE
            </Button>
        </Card>
    )

    const denied = (
        <Card header={Header}>
            <View>
                <Text>You have denied this invite</Text>
            </View>
        </Card>
    )

    const accepted = (
        <Card header={Header}>
            <View>
                <Text>You have accepted this invite. Waiting for more information from the researcher</Text>
            </View>
        </Card>
    )

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
                {notification.state === NotificationState.INVITE_DENIED && denied}
                {notification.state === NotificationState.INVITED && invited}
                {notification.state === NotificationState.INFORMATION_REQUESTED && accepted}
            </View>
        </Layout>
    );
}