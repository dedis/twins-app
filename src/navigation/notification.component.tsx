import React, { useEffect } from 'react';
import { LayoutList } from '../components/layout-list.component';
import { LayoutItem } from '../model/layout-item.model';
import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';
import { Connection } from 'aries-framework-javascript';
import { MessageType as ConsentMessageType, ConsentStatus } from '../agent/protocols/consent/messages';

export interface Notification extends LayoutItem {
  route: string;
  documentDarc: string;
  orgName: string;
  studyName: string;
  publicDid: string;
  status: ConsentStatus;
  verkey: Verkey
}

export const NotificationScreen = ({navigation, screenProps}) => {
  const { notificationState } = screenProps;

  const onItemPress = (index: number): void => {
    const { route } = notificationState[index];
    navigation.navigate(route, { data: { index } });
  }

  return (
    <LayoutList
      data={notificationState}
      onItemPress={onItemPress}
    />
  );
}