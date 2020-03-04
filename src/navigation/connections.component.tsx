import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-navigation';
import { List, ListItem, Icon, Divider } from '@ui-kitten/components';
import { View } from 'react-native';
import { LayoutListElement, LayoutList } from '../components/layout-list.component';
import { Agent, Connection } from 'aries-framework-javascript';
import { LayoutItem } from 'src/model/layout-item.model';
import { Event } from 'aries-framework-javascript/build/lib/agent/events';

export interface Connections extends LayoutItem {
  route: string;
  connection: Connection,
  did: string,
}

export const ConnectionsScreen = ({ navigation, screenProps }): LayoutListElement => {

  const { connectionState } =  screenProps;


  const onItemPress = (index: number): void => {
    const { route, connection } = connectionState[index];
    navigation.navigate(route, { connection });
  }

  return (
    <LayoutList
      data={connectionState}
      onItemPress={onItemPress}
      />
  );
};