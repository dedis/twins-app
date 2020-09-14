import React from 'react';
import { Layout, TopNavigation, useStyleSheet, StyleService, Card, Button } from "@ui-kitten/components";
import { View, Text } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import logger from "aries-framework-javascript/build/lib/logger"
import { EdgeAgent } from 'src/agent/agent';
import { useSelector } from 'react-redux';
import { RootState } from 'src/app/rootReducer';

export const ConsentInformationRequestScreen = ({ navigation, screenProps }) => {
    const safeArea = useSafeArea();

    const { agent } = screenProps; 
    const themedStyles = StyleService.create({
        container: {
            flex: 1,
        },
    });

    const notificationId = navigation.getParam('notificationId');

    const notifications = useSelector((state: RootState) => state.notifications);

    const onGrant = async () => {
        logger.log('Granting');
        await (agent as EdgeAgent).consentModule.grantConsent(notificationId);
    }

    const styles = useStyleSheet(themedStyles);
    return (
        <Layout
            style={[styles.container, { paddingTop: safeArea.top }]}
            level='2'
        >
            <TopNavigation
                alignment='center'
                title='Consent Information'
            />
            <View style={{ margin: 10, flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <Card>
                    <Button
                        onPress={onGrant}
                        size='small' status='danger'>
                        GRANT
                    </Button>
                </Card>
            </View>

        </Layout>
    );
}