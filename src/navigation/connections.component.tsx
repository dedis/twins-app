import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-navigation';
import { List, ListItem, Icon, Divider } from '@ui-kitten/components';
import { View } from 'react-native';
import { LayoutListElement, LayoutList } from '../components/layout-list.component';
import { Agent, Connection } from 'aries-framework-javascript';
import { LayoutItem } from 'src/model/layout-item.model';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';

interface Connections extends LayoutItem {
  route: string;
  connection: Connection
}

export const ConnectionsScreen = ({ navigation, screenProps }): LayoutListElement => {

  const agent: Agent = screenProps.agent;

  const onItemPress = (index: number): void => {
    const { route, connection } = connectionState[index];
    navigation.navigate(route, { connection });
  }

  const [ connectionState, setConnectionState ] = React.useState<Connections[]>([]);

  useEffect(() => {
    agent.context.eventEmitter.on(Event.CONNECTION_ESTABLISHED, (connection: Connection) => {
      console.log('In here, connection got added');
      console.log(connection);
      if (connection.theirDidDoc && connection.theirDidDoc.id) {
        setConnectionState(prevConnections => [
          ...prevConnections,
          {
            title: connection.didDoc.id,
            description: '',
            route: 'Chat',
            connection
          }
        ]);
      }
    });
  }, []);

  return (
    <LayoutList
      data={connectionState}
      onItemPress={onItemPress}
      />
  );
};