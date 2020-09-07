import React, { useEffect } from 'react';
import { LayoutList } from '../../components/layout-list.component';
import { LayoutItem } from '../../model/layout-item.model';
import { MessageType as ConsentMessageType, ConsentStatus } from '../../agent/protocols/consent/messages';
import { useSelector } from 'react-redux';
import { RootState } from 'src/app/rootReducer';
import { NavigatorType, NavigationContainer } from 'react-navigation';
import { NotificationState } from '../notifications/notificationsSlice';
import logger from 'aries-framework-javascript/build/lib/logger'

export interface Notification extends LayoutItem {
  route: string;
  documentDarc: string;
  orgName: string;
  studyName: string;
  publicDid: string;
  status: ConsentStatus;
  verkey: Verkey
}


const { INVITED, INVITE_DENIED, REQUESTED, REQUEST_DENIED, REQUEST_ACCEPTED } = NotificationState;

const stateToRouteMap = {
  0: 'CohortInvite',
  1: 'CohortInvite',
  2: 'CohortRequest',
  3: 'CohortReqest',
  4: 'CohortRequest'
}

export const NotificationScreen = ({navigation, screenProps}) => {
  const notifications = useSelector((state: RootState) => state.notifications);

  const onItemPress = (index: number): void => {
    logger.logJson('stateToRouteMap', stateToRouteMap);
    // @ts-ignore
    const route = stateToRouteMap[notifications.items[index].state.toString()];
    logger.log('route', route);
    logger.log('id', notifications.items[index].id);
    logger.logJson('itemsById', notifications.itemsById);
    navigation.navigate(route, { notificationId: notifications.items[index].id });
  }

  return (
    <LayoutList
      data={notifications.items}
      onItemPress={onItemPress}
    />
  );
}