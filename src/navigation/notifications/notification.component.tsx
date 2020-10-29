import React, { useEffect } from 'react';
import { LayoutList } from '../../components/layout-list.component';
import { LayoutItem } from '../../model/layout-item.model';
import { MessageType as ConsentMessageType, ConsentStatus } from '../../agent/protocols/consent/messages';
import { useSelector } from 'react-redux';
import { RootState } from 'src/app/rootReducer';
import { NavigatorType, NavigationContainer, SafeAreaView } from 'react-navigation';
import { NotificationState } from '../notifications/notificationsSlice';
import logger from 'aries-framework-javascript/build/lib/logger'
import { StyleService, useStyleSheet } from '@ui-kitten/components';

export interface Notification extends LayoutItem {
  route: string;
  documentDarc: string;
  orgName: string;
  studyName: string;
  publicDid: string;
  status: ConsentStatus;
  verkey: Verkey
}


const { INVITED, INVITE_DENIED, INFORMATION_REQUESTED, INFORMATION_PROVIDED, INFORMATION_FAILURE, CONSENT_GRANTED, CONSENT_DENIED, CREDENTIAL_OFFERED, CREDENTIAL_REQUESTED, CREDENTIAL_ISSUED} = NotificationState;

const stateToRouteMap = {
  0: 'ConsentInvite',
  1: 'ConsentInvite',
  2: 'ConsentInformationRequest',
  3: 'ConsentInformationRequest',
  4: 'ConsentInformationRequest',
  5: 'ConsentInformationRequest',
  6: 'ConsentInformationRequest',
  7: 'Credential',
  8: 'Credential',
  9: 'Credential',
}

export const NotificationScreen = ({navigation, screenProps}) => {
  const notifications = useSelector((state: RootState) => state.notifications);
  const themedStyles = StyleService.create({
    safeArea: {
      backgroundColor: '$background-basic-color-2',
      flex: 1,
      color: '$text-basic-color',
    }
  })

  const styles = useStyleSheet(themedStyles);


  const onItemPress = (index: number): void => {
    logger.logJson('stateToRouteMap', stateToRouteMap);
    // @ts-ignore
    const route = stateToRouteMap[notifications.items[index].state.toString()];
    navigation.navigate(route, { notificationId: notifications.items[index].id });
  }

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <LayoutList
        data={notifications.items}
        onItemPress={onItemPress}
      />
    </SafeAreaView>
  );
}