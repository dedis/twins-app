import React, { useEffect } from 'react';
import { LayoutList } from '../components/layout-list.component';
import { LayoutItem } from '../model/layout-item.model';
import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';
import { Connection } from 'aries-framework-javascript';
import { MessageType as ConsentMessageType, ConsentStatus } from '../agent/protocols/consent/messages';
import { consentService } from '../App';

interface Notification extends LayoutItem {
  route: string;
  documentDarc: string;
  orgName: string;
  studyName: string;
  publicDid: string;
  status: ConsentStatus;
  verkey: Verkey
}

export const NotificationScreen = ({navigation, screenProps}) => {
  const [ notificationState, setNotificationState ] = React.useState<Notification[]>([]);

  const onItemPress = (index: number): void => {
    const { route } = notificationState[index];
    navigation.navigate(route, { data: {index, notificationState, setNotificationState} });
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
          const {documentDarc, orgName, studyName, publicDid,  } = consentService.getDataForRequest(connection);
          const { verkey } = connection;
          setNotificationState(prevNotifications => [
            ...prevNotifications,
            {
              title: 'Consent Request',
              description: `${orgName} would like to request your consent for their study on ${studyName}`,
              route: 'ConsentRequest',
              documentDarc,
              orgName,
              studyName,
              publicDid,
              status: ConsentStatus.UNDECIDED,
              verkey
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