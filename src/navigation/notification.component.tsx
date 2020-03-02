import React, { useEffect } from 'react';
import { LayoutList } from '../components/layout-list.component';
import { LayoutItem } from '../model/layout-item.model';
import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';
import { Connection } from 'aries-framework-javascript';
import uuid from 'uuid/v4';
import { MessageType as ConsentMessageType } from '../agent/protocols/consent/messages';
import { consentService } from '../App';

interface Notification extends LayoutItem {
  route: string;
  data: {}
}

export const NotificationScreen = ({navigation, screenProps}) => {
  const [ notificationState, setNotificationState ] = React.useState<Notification[]>([]);

  const onItemPress = (index: number): void => {
    const { route, data } = notificationState[index];
    navigation.navigate(route, { data });
  }

  const { agent } = screenProps;

  useEffect(() => {
    console.log('Waiting for notifications...');
    agent.context.eventEmitter.on(Event.MESSAGE_RECEIVED, (message: InboundMessage) => {
      if (message.message['@type'] && message.message['@type'] == ConsentMessageType.ConsentChallengeResponse) {
        // TODO: Move this to handler
        const connection: Connection = agent.findConnectionByTheirKey(message.sender_verkey);
        if (consentService.verifyChallengeResponse(connection, message.message.nonce)) {
          console.log('Nonce verified');
          // @ts-ignore
          const {documentDarc, comment, publicDid } = consentService.getDataForRequest(connection);
          const { verkey } = connection;
          setNotificationState(prevNotifications => [
            ...prevNotifications,
            {
              title: 'Consent Request',
              description: comment,
              route: 'ConsentRequest',
              data: { documentDarc, comment, publicDid, verkey },
            }
          ]);
        }
      }
    });
  }, []);

  return (
    <LayoutList
      data={notificationState}
      onItemPress={onItemPress}
    />
  );
}